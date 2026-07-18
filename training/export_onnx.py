import os
import argparse
import torch
import torch.nn as nn
import torchvision.models as models

class BaselineMultiTaskModel(nn.Module):
    def __init__(self, num_species=24, num_threats=9):
        super().__init__()
        self.backbone = models.efficientnet_b0(weights=None)
        in_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Identity()
        
        self.species_head = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_species)
        )
        self.human_head = nn.Sequential(
            nn.Linear(in_features, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_threats)
        )

    def forward(self, x):
        features = self.backbone(x)
        species_logits = self.species_head(features)
        threat_logits = self.human_head(features)
        return species_logits, threat_logits

class AdvancedMultiTaskModel(nn.Module):
    def __init__(self, num_species=24, num_threats=9):
        super().__init__()
        self.backbone = models.efficientnet_v2_s(weights=None)
        in_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Identity()
        
        self.species_head = nn.Sequential(
            nn.Linear(in_features, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_species)
        )
        self.human_head = nn.Sequential(
            nn.Linear(in_features, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_threats)
        )

    def forward(self, x):
        features = self.backbone(x)
        species_logits = self.species_head(features)
        threat_logits = self.human_head(features)
        return species_logits, threat_logits

class ONNXMultiTaskWrapper(nn.Module):
    def __init__(self, model):
        super().__init__()
        self.model = model

    def forward(self, x):
        species_logits, threat_logits = self.model(x)
        # Tích hợp Sigmoid cho Species và Softmax cho Human Threat vào đồ thị ONNX
        species_probs = torch.sigmoid(species_logits)
        threat_probs = torch.softmax(threat_logits, dim=1)
        return species_probs, threat_probs

def export_to_onnx(model_type, checkpoint_path, output_path):
    print(f"=== ĐANG XUẤT MÔ HÌNH SANG ĐỊNH DẠNG ONNX ===")
    print(f"1. Loại mô hình: {model_type.upper()}")
    print(f"2. Đường dẫn checkpoint: {checkpoint_path}")
    print(f"3. Đường dẫn lưu ONNX: {output_path}")

    # 1. Khởi tạo mô hình dựa trên loại
    if model_type.lower() == 'baseline':
        model = BaselineMultiTaskModel(num_species=24, num_threats=9)
    elif model_type.lower() == 'advanced':
        model = AdvancedMultiTaskModel(num_species=24, num_threats=9)
    else:
        raise ValueError("model_type phải là 'baseline' hoặc 'advanced'")

    # 2. Nạp checkpoint
    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(f"Không tìm thấy file checkpoint PyTorch tại: {checkpoint_path}")
    
    state_dict = torch.load(checkpoint_path, map_location='cpu')
    model.load_state_dict(state_dict)
    print("-> Nạp thành công trọng số PyTorch checkpoint.")

    # 3. Bọc mô hình với lớp kích hoạt đầu ra ONNX
    wrapped_model = ONNXMultiTaskWrapper(model)
    wrapped_model.eval()  # Chế độ evaluation (tắt dropout)

    # 4. Chuẩn bị tensor đầu vào giả định (Dummy Input)
    dummy_input = torch.randn(1, 3, 224, 224, dtype=torch.float32)

    # 5. Xuất ONNX
    torch.onnx.export(
        wrapped_model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=17,  # Sử dụng Opset mới ổn định cho EfficientNet
        do_constant_folding=True,
        input_names=['input_spectrogram'],
        output_names=['species_probabilities', 'threat_probabilities'],
        dynamic_axes={
            'input_spectrogram': {0: 'batch_size'},
            'species_probabilities': {0: 'batch_size'},
            'threat_probabilities': {0: 'batch_size'}
        }
    )
    print(f"-> Xuất ONNX hoàn tất: {output_path}")

    # 6. Kiểm tra lại tính hợp lệ của file ONNX
    try:
        import onnx
        onnx_model = onnx.load(output_path)
        onnx.checker.check_model(onnx_model)
        print("✓ ONNX model syntax và graph hoàn chỉnh hợp lệ!")
    except ImportError:
        print("💡 Cảnh báo: Chưa cài đặt thư viện 'onnx'. Khuyên dùng chạy `pip install onnx` để kiểm tra độ tin cậy.")
    except Exception as e:
        print(f"❌ Phát hiện lỗi khi kiểm tra ONNX: {e}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Export PyTorch BioListen Multi-task Model to ONNX.")
    parser.add_argument('--model_type', type=str, default='baseline', choices=['baseline', 'advanced'], help="baseline hoặc advanced")
    parser.add_argument('--checkpoint', type=str, required=True, help="Đường dẫn đến file .pt")
    parser.add_argument('--output', type=str, default='model.onnx', help="Đường dẫn file .onnx đầu ra")
    
    args = parser.parse_args()
    export_to_onnx(args.model_type, args.checkpoint, args.output)
