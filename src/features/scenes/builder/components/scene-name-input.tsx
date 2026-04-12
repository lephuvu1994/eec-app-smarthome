import { FloatInput } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';
import { translate } from '@/lib/i18n';

type TProps = {
  field: any;
};

export function SceneNameInput({ field }: TProps) {
  return (
    <FloatInput
      value={field.state.value}
      onChangeText={field.handleChange}
      onBlur={field.handleBlur}
      label={translate('scenes.builder.namePlaceholder')}
      testID="scene-name"
      containerClassName="bg-white shadow dark:bg-white/10"
      inputClassName="text-[#1B1B1B] dark:text-white"
      labelTextColor="#737373"
      labelTextColorInactive="#737373"
      borderColor={{
        active: '#10B981', // emerald-500
        inactive: 'transparent',
      }}
      error={getFieldError(field)}
    />
  );
}
