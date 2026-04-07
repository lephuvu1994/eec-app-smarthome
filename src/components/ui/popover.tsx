import * as PopoverPrimitive from '@rn-primitives/popover';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    portalHost?: string;
  }
>(({ className, align = 'center', sideOffset = 4, portalHost, ...props }, ref) => {
  return (
    <PopoverPrimitive.Portal hostName={portalHost}>
      <PopoverPrimitive.Overlay style={StyleSheet.absoluteFill}>
        {/* You can add custom animation or Backdrop here */}
        <PopoverPrimitive.Overlay
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
          closeOnPress
        />
      </PopoverPrimitive.Overlay>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        // eslint-disable-next-line better-tailwindcss/no-unknown-classes
        className={`z-50 rounded-2xl bg-white shadow-lg dark:bg-[#1C1C1E] ${className}`}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const PopoverClose = PopoverPrimitive.Close;

export { Popover, PopoverClose, PopoverContent, PopoverTrigger };
