import type { ViewStyle } from 'react-native';

import * as React from 'react';
import { View } from 'react-native';
import * as DropdownMenu from 'zeego/dropdown-menu';

// ==========================================
// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU ĐA HÌNH (TYPES)
// ==========================================
export type TMenuIcon = {
  ios?: string; // Tên Icon SF Symbols (VD: 'trash', 'pencil')
  android?: string; // Tên Icon Drawable (VD: 'ic_menu_edit')
};

// Loại 1: Đường phân cách
export type TMenuSeparator = {
  type: 'separator';
  key: string;
  isHidden?: boolean;
};

// Loại 2: Checkbox (Tích chọn)
export type TMenuCheckbox = {
  type: 'checkbox';
  key: string;
  title: string;
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  icon?: TMenuIcon;
  isDisabled?: boolean;
  isHidden?: boolean;
};

// Loại 3: Nhóm (Group) chứa các Item bên trong
export type TMenuGroup = {
  type: 'group';
  key: string;
  title?: string; // Tiêu đề nhỏ (Label) của nhóm
  items: TMenuElement[]; // Các phần tử bên trong nhóm
  isHidden?: boolean;
};

// Loại 4: Nút bấm bình thường hoặc Menu lồng (Submenu)
export type TMenuItem = {
  type?: 'item'; // Khai báo mặc định là 'item'
  key: string;
  title: string;
  icon?: TMenuIcon;
  isDestructive?: boolean; // True -> Nút màu đỏ (Cảnh báo/Xóa)
  isDisabled?: boolean; // True -> Nút bị mờ, không bấm được
  isHidden?: boolean;
  onPress?: () => void;
  children?: TMenuElement[]; // Nếu có mảng này -> Tự động thành Submenu
};

// Tổng hợp lại thành 1 Type chung
export type TMenuElement = TMenuItem | TMenuGroup | TMenuSeparator | TMenuCheckbox;

export type TSharedNativeMenuProps = {
  /** Thẻ UI dùng để bấm mở Menu (Button, Icon, Text...) */
  triggerComponent: React.ReactNode;

  /** Mảng cấu hình Data để render Menu */
  elements: TMenuElement[];

  /** (Optional) Tiêu đề to trên cùng của Menu (iOS) */
  menuTitle?: string;

  /** (Optional) Căn chỉnh Menu */
  align?: 'start' | 'center' | 'end';

  /**
   * (Optional) Style cho DropdownMenu.Root container.
   * Workaround cho Zeego issue #180: khi dùng trong headerRight,
   * truyền { alignSelf: 'flex-end' } để fix width expand.
   */
  style?: ViewStyle;
};

// ==========================================
// 2. COMPONENT CHÍNH
// ==========================================
export const ZeegoNativeMenu = React.memo(({
  triggerComponent,
  elements,
  menuTitle,
  align = 'end',
  style,
}: TSharedNativeMenuProps) => {
  // Hàm đệ quy: Đọc Data và đẻ ra Native UI tương ứng
  const renderElement = (el: TMenuElement) => {
    // 0️⃣ Nếu bị ẩn theo logic -> Bỏ qua
    if (el.isHidden)
      return null;

    // 1️⃣ Xử lý Đường kẻ ngang
    if (el.type === 'separator') {
      return <DropdownMenu.Separator key={el.key} />;
    }

    // 2️⃣ Xử lý Checkbox
    if (el.type === 'checkbox') {
      return (
        <DropdownMenu.CheckboxItem
          key={el.key}
          // Ép kiểu true/false thành chuỗi 'on'/'off' cho Zeego hiểu
          value={el.value ? 'on' : 'off'}
          // Khi Zeego trả về 'on'/'off', ta dịch ngược lại thành true/false cho Component cha
          onValueChange={state => el.onValueChange(state === 'on')}
          disabled={el.isDisabled}
        >
          <DropdownMenu.ItemIndicator />
          <DropdownMenu.ItemTitle>{el.title}</DropdownMenu.ItemTitle>
          {el.icon?.ios && <DropdownMenu.ItemIcon ios={{ name: el.icon.ios }} />}
        </DropdownMenu.CheckboxItem>
      );
    }

    // 3️⃣ Xử lý Nhóm (Group)
    if (el.type === 'group') {
      return (
        <DropdownMenu.Group key={el.key}>
          {el.title && <DropdownMenu.Label>{el.title}</DropdownMenu.Label>}
          {/* Gọi đệ quy để render các item bên trong Group */}
          {el.items.map(renderElement)}
        </DropdownMenu.Group>
      );
    }

    // 4️⃣ Xử lý Nút bình thường & Submenu (el.type === 'item' hoặc undefined)
    const item = el as TMenuItem;

    // Nếu có children -> Render Menu lồng nhau (Submenu)
    if (item.children && item.children.length > 0) {
      return (
        <DropdownMenu.Sub key={item.key}>
          <DropdownMenu.SubTrigger key={`${item.key}-trigger`}>
            <DropdownMenu.ItemTitle>{item.title}</DropdownMenu.ItemTitle>
            {item.icon?.ios && <DropdownMenu.ItemIcon ios={{ name: item.icon.ios }} />}
          </DropdownMenu.SubTrigger>

          <DropdownMenu.SubContent>
            {item.children.map(renderElement)}
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      );
    }

    // Nếu là Nút bấm cuối cùng
    return (
      <DropdownMenu.Item
        key={item.key}
        onSelect={item.onPress} // Zeego dùng onSelect
        destructive={item.isDestructive}
        disabled={item.isDisabled}
      >
        <DropdownMenu.ItemTitle>{item.title}</DropdownMenu.ItemTitle>
        {item.icon?.ios && <DropdownMenu.ItemIcon ios={{ name: item.icon.ios }} />}
      </DropdownMenu.Item>
    );
  };

  // ==========================================
  // RENDER GỐC
  // ==========================================
  return (
    <View style={style}>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {triggerComponent}
        </DropdownMenu.Trigger>

        <DropdownMenu.Content align={align}>
          {menuTitle && <DropdownMenu.Label>{menuTitle}</DropdownMenu.Label>}
          {elements.map(renderElement)}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </View>
  );
});
