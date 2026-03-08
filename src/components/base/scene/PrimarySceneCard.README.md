# PrimarySceneCard

Component thẻ `PrimarySceneCard` được thiết kế linh hoạt để hiển thị các kịch bản, thiết bị, hoặc phím tắt nhanh trong ứng dụng Smart Home. Hỗ trợ đầy đủ các hiệu ứng như: màu đơn sắc, màu gradient, ảnh nền chìm (pattern/3D icon), và hiệu ứng ánh sáng (glossy).

## Import
```tsx
import { PrimarySceneCard } from "@/components/base/scene/PrimarySceneCard";
```

## Props (Thuộc tính)

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **`title`** | `string` | _(Bắt buộc)_ | Tên kịch bản hoặc thiết bị. Hiển thị tối đa 2 dòng. |
| **`icon`** | `React.ReactNode` \| `null` | `undefined` | Component Icon. Nếu truyền `null`, vùng chứa icon sẽ bị ẩn đi. |
| **`cardColor`** | `string` | `'#FFFFFF'` | Màu nền đơn sắc của thẻ (chỉ áp dụng khi không dùng `bgGradient`). |
| **`bgGradient`** | `[string, string]` | `undefined` | Mảng gồm 2 mã màu để tạo nền Gradient từ trên xuống dưới. |
| **`iconBgColor`** | `string` | `'rgba(255, 255, 255, 0.3)'`| Màu nền của ô vuông chứa Icon. Dùng `'transparent'` để ẩn nền mờ. |
| **`textColor`** | `string` | `'#1B1B1B'` | Màu của text tiêu đề. |
| **`menuIconColor`** | `string` | `'#1B1B1B'` | Màu của nút menu (3 chấm ngang). |
| **`bgPattern`** | `ImageSourcePropType`| `undefined` | File ảnh nền, ví dụ như hoạ tiết lượn sóng hoặc icon 3D đặt vào góc. |
| **`bgPatternStyle`**| `ImageStyle` | `undefined` | Style tuỳ chỉnh cho `bgPattern` (chủ yếu dùng để can thiệp vị trí, kích thước ảnh: `right`, `bottom`, `width`, `height`). |
| **`showGlossyEffect`**| `boolean`| `false` | Bật/tắt hiệu ứng quầng sáng hắt từ góc trái trên xuống (Glassmorphism highlight). |
| **`containerStyle`**| `ViewStyle` | `undefined` | Can thiệp CSS inline cho vùng ngoài cùng. Dùng để set cố định `width`, `height`. |
| **`className`** | `string` | `undefined` | Class của Tailwind/Nativewind. |
| **`onPress`** | `() => void` | `undefined` | Hành động khi nhấn vào toàn bộ thẻ. |
| **`onMenuPress`** | `() => void` | `undefined` | Hành động khi nhấn vào nút menu ở góc phải. |

---

## Các Ví Dụ Sử Dụng (Examples)

### 1. Minimalist (Tối giản sáng sủa)
Thẻ thông thường, hợp với các action phổ thông.
```tsx
<PrimarySceneCard
  title="Về nhà"
  cardColor="#FFFFFF"          
  iconBgColor="#F2FCEE"        
  textColor="#1B1B1B"          
  menuIconColor="#9CA3AF"      
  icon={<MaterialCommunityIcons name="home-outline" size={20} color="#84CC16" />}
/>
```

### 2. Gradient rực rỡ (Không dùng ô nền icon)
Dùng mảng 2 màu gradient để tạo sự nổi bật mạnh mẽ.
```tsx
<PrimarySceneCard
  title="Thức dậy sớm"
  bgGradient={['#FBBF24', '#F59E0B']} // Vàng sang Cam
  textColor="#FFFFFF"                 
  menuIconColor="#FFFFFF"
  iconBgColor="transparent"           // Ẩn nền vuông chứa icon
  icon={<MaterialCommunityIcons name="white-balance-sunny" size={24} color="#FFFFFF" />}
/>
```

### 3. Dark Mode & Hiệu ứng Glossy
Nền tối kết hợp với hiệu ứng hắt sáng kim loại siêu sang chảnh.
```tsx
<PrimarySceneCard
  title="Giải trí (Phim)"
  cardColor="#1F2937"          
  iconBgColor="#374151"        
  textColor="#F9FAFB"          
  menuIconColor="#9CA3AF"
  icon={<MaterialCommunityIcons name="movie-open-outline" size={20} color="#A78BFA" />}
  showGlossyEffect={true}      // Bật quầng sáng
/>
```

### 4. Thẻ Text-Only (Không chứa Icon)
Khi không có Icon, hãy truyền `null` để dòng tiêu đề được căn chỉnh đẩy lên đẹp mắt.
```tsx
<PrimarySceneCard
  title="Tắt toàn bộ thiết bị nhà"
  cardColor="#FEE2E2"         
  textColor="#991B1B"         
  menuIconColor="#EF4444"
  icon={null}                 // Bỏ qua Icon
/>
```

### 5. Có chèn thêm hoạ tiết Background (Pattern / 3D Asset)
Rất phù hợp để làm các Banner dài (Full width) hoặc các thẻ siêu nổi bật.
```tsx
<PrimarySceneCard
  title="Chế độ làm mát nâng cao"
  bgGradient={['#34D399', '#059669']} 
  textColor="#FFFFFF"
  menuIconColor="#FFFFFF"
  iconBgColor="rgba(255, 255, 255, 0.2)"
  icon={<MaterialCommunityIcons name="spa-outline" size={24} color="#FFFFFF" />}
  showGlossyEffect={true}
  containerStyle={{ height: 130 }}    // Kéo dài chiều cao
  
  // Dùng ảnh nền đè lên trên (Nhớ setup path của ảnh cho đúng)
  bgPattern={require('@/assets/images/leaf-pattern.png')}
  bgPatternStyle={{ 
    opacity: 0.15, 
    right: -20, 
    bottom: -20, 
    width: 120, 
    height: 120 
  }}
/>
```
