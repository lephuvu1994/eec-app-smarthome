# Native Menu Component Guide (`SharedNativeMenu`)

`SharedNativeMenu` là một wrapper component dựa trên thư viện `zeego`, giúp dễ dàng tạo các context menu/dropdown menu đồng nhất với trải nghiệm Native trên iOS và Android bằng cách sử dụng cấu hình dữ liệu (Data-driven).

## 🚀 Tính năng chính
- ✅ **Native Experience**: Sử dụng UI native của hệ điều hành.
- ✅ **Đa hình (Polymorphic)**: Hỗ trợ Item thường, Group, Separator, Checkbox và Submenu.
- ✅ **Đệ quy**: Hỗ trợ lồng menu nhiều cấp (Submenu) vô hạn.
- ✅ **Dễ sử dụng**: Chỉ cần truyền mảng `elements` để render.

---

## 🛠 Định nghĩa Kiểu dữ liệu (Types)

### 1. `TMenuItem` (Nút bấm)
Dùng cho các hành động đơn lẻ hoặc menu lồng.
- `key`: Định danh duy nhất.
- `title`: Nhãn hiển thị.
- `icon`: Biểu tượng (SF Symbols trên iOS).
- `onPress`: Hàm thực thi khi bấm vào.
- `isDestructive`: Hiển thị màu đỏ (Cảnh báo).
- `children`: Nếu có, item sẽ tự động trở thành Submenu.

### 2. `TMenuGroup` (Nhóm)
Dùng để phân loại các item.
- `title`: (Tùy chọn) Nhãn tiêu đề cho nhóm.
- `items`: Danh sách các phần tử bên trong nhóm.

### 3. `TMenuCheckbox` (Tích chọn)
Dùng để bật/tắt trạng thái.
- `value`: Giá trị boolean (`true`/`false`).
- `onValueChange`: Hàm xử lý khi thay đổi trạng thái.

### 4. `TMenuSeparator` (Đường kẻ)
Dùng để phân cách các phần giữa menu.

---

## 📖 Hướng dẫn sử dụng

### Cấu hình cơ bản

```tsx
import type { TMenuElement } from './zeego-native-menu';
import { Button } from './button'; // Hoặc bất kỳ component nào
import { ZeegoNativeMenu } from './zeego-native-menu';

const menuElements: TMenuElement[] = [
  {
    key: 'edit',
    title: 'Chỉnh sửa',
    icon: { ios: 'pencil' },
    onPress: () => console.log('Edit'),
  },
  {
    type: 'separator',
    key: 'sep-1',
  },
  {
    key: 'delete',
    title: 'Xóa',
    icon: { ios: 'trash' },
    isDestructive: true,
    onPress: () => console.log('Delete'),
  },
];

export function MyComponent() {
  return (
    <ZeegoNativeMenu
      triggerComponent={<Button title="Mở Menu" />}
      elements={menuElements}
      menuTitle="Tùy chọn"
    />
  );
}
```

### Sử dụng Submenu (Menu lồng)

```tsx
const elements: TMenuElement[] = [
  {
    key: 'share',
    title: 'Chia sẻ',
    children: [
      { key: 'copy', title: 'Sao chép liên kết' },
      { key: 'email', title: 'Gửi qua Email' },
    ],
  },
];
```

### Sử dụng Group và Checkbox

```tsx
const elements: TMenuElement[] = [
  {
    type: 'group',
    key: 'filter-group',
    title: 'Bộ lọc',
    items: [
      {
        type: 'checkbox',
        key: 'sort',
        title: 'Sắp xếp theo tên',
        value: true,
        onValueChange: val => console.log(val),
      },
    ],
  },
];
```

---

## 🎨 Tùy biến Layout (Customization)

| Thuộc tính | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `triggerComponent` | `ReactNode` | Thành phần giao diện dùng để tương tác mở menu. |
| `elements` | `TMenuElement[]` | Mảng các phần tử cấu thành menu. |
| `menuTitle` | `string` | (iOS) Tiêu đề hiển thị ở đầu menu. |
| `align` | `'start' \| 'center' \| 'end'` | Căn chỉnh vị trí menu so với trigger (Mặc định: `end`). |

---

## 💡 Lưu ý quan trọng
1. **Icon**: Hiện tại hỗ trợ SF Symbols cho iOS qua thuộc tính `ios`. Đảm bảo tên icon hợp lệ với Apple SF Symbols.
2. **Hidden**: Tất cả các loại element đều hỗ trợ thuộc tính `isHidden`. Điều này giúp bạn ẩn/hiện item theo logic nghiệp vụ một cách dễ dàng.
