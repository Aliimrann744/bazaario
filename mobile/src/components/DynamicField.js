import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { taxonomy } from '../api/endpoints';
import { humanize } from '../utils/format';
import OptionSheet from './OptionSheet';
import MediaInput from './MediaInput';

// DynamicField — renders a single schema-driven field from GET /categories/:id/form-schema.
// Supports: text, textarea, integer, decimal, money, single_select, multi_select,
// reference_select (with dependsOn), boolean, date, location, media.
//
// Props:
//  field         schema field object
//  value         current value
//  onChange(val) setter
//  error         validation message
//  form          full attributes object (to resolve dependsOn parent values)
//  onPickLocation()  callback for type 'location'
//  locationLabel display label of the chosen location
export default function DynamicField({ field, value, onChange, error, form = {}, onPickLocation, locationLabel }) {
  const { type, label, required, key } = field;
  const labelEl = (
    <Text style={styles.label}>
      {label}
      {required ? <Text style={styles.req}> *</Text> : null}
      {field.unit ? <Text style={styles.unit}> ({field.unit})</Text> : null}
    </Text>
  );

  let control = null;

  if (type === 'text' || type === 'textarea') {
    control = (
      <TextInput
        value={value ?? ''}
        onChangeText={onChange}
        placeholder={field.placeholder || `Enter ${label.toLowerCase()}`}
        placeholderTextColor={colors.mutedLight}
        style={[styles.input, type === 'textarea' && styles.textarea, error && styles.inputError]}
        multiline={type === 'textarea'}
        numberOfLines={type === 'textarea' ? 5 : 1}
        textAlignVertical={type === 'textarea' ? 'top' : 'center'}
      />
    );
  } else if (type === 'integer' || type === 'decimal') {
    control = (
      <TextInput
        value={value === undefined || value === null ? '' : String(value)}
        onChangeText={(t) => onChange(parseNumber(t, type))}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={colors.mutedLight}
        keyboardType={type === 'integer' ? 'number-pad' : 'decimal-pad'}
        style={[styles.input, error && styles.inputError]}
      />
    );
  } else if (type === 'money') {
    control = <MoneyInput value={value} onChange={onChange} error={error} />;
  } else if (type === 'boolean') {
    control = (
      <View style={styles.switchRow}>
        <Text style={styles.switchHint}>{value ? 'Yes' : 'No'}</Text>
        <Switch
          value={!!value}
          onValueChange={onChange}
          trackColor={{ true: colors.primary, false: colors.line }}
          thumbColor={colors.white}
        />
      </View>
    );
  } else if (type === 'date') {
    control = (
      <TextInput
        value={value ?? ''}
        onChangeText={onChange}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.mutedLight}
        style={[styles.input, error && styles.inputError]}
      />
    );
  } else if (type === 'location') {
    control = (
      <Pressable onPress={onPickLocation} style={[styles.select, error && styles.inputError]}>
        <Ionicons name="location-outline" size={18} color={colors.muted} />
        <Text style={[styles.selectText, !locationLabel && styles.placeholder]} numberOfLines={1}>
          {locationLabel || 'Choose location'}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
      </Pressable>
    );
  } else if (type === 'media') {
    control = <MediaInput value={value} onChange={onChange} min={field.validation?.minItems} max={field.validation?.maxItems} />;
  } else if (type === 'single_select' || type === 'multi_select' || type === 'reference_select') {
    control = <SelectField field={field} value={value} onChange={onChange} error={error} form={form} />;
  } else {
    // Fallback for any unknown type — plain text.
    control = (
      <TextInput
        value={value ?? ''}
        onChangeText={onChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        placeholderTextColor={colors.mutedLight}
        style={[styles.input, error && styles.inputError]}
      />
    );
  }

  return (
    <View style={styles.field}>
      {labelEl}
      {control}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function MoneyInput({ value, onChange, error }) {
  // value is stored in MINOR units (paisa). Display rupees.
  const rupees = value === undefined || value === null || value === '' ? '' : String(Math.round(Number(value) / 100));
  return (
    <View style={[styles.moneyWrap, error && styles.inputError]}>
      <Text style={styles.moneyPrefix}>Rs</Text>
      <TextInput
        value={rupees}
        onChangeText={(t) => {
          const digits = t.replace(/[^0-9]/g, '');
          onChange(digits ? Number(digits) * 100 : 0);
        }}
        placeholder="0"
        placeholderTextColor={colors.mutedLight}
        keyboardType="number-pad"
        style={styles.moneyInput}
      />
    </View>
  );
}

function SelectField({ field, value, onChange, error, form }) {
  const { type, label } = field;
  const multi = type === 'multi_select' || field.multi;
  const isReference = type === 'reference_select';
  const [open, setOpen] = useState(false);
  const [refOptions, setRefOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const parentValue = field.dependsOn ? form[field.dependsOn] : null;
  const blockedByParent = field.dependsOn && !parentValue;

  useEffect(() => {
    let active = true;
    if (!isReference || !open) return undefined;
    if (blockedByParent) return undefined;
    setLoading(true);
    taxonomy
      .referenceData(field.referenceCatalog, parentValue || undefined)
      .then((res) => {
        if (active) setRefOptions(res.items || []);
      })
      .catch(() => active && setRefOptions([]))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [isReference, open, field.referenceCatalog, parentValue, blockedByParent]);

  const options = isReference ? refOptions : field.options || [];

  const display = useMemo(() => {
    if (multi) {
      const arr = Array.isArray(value) ? value : [];
      if (!arr.length) return null;
      const labels = arr.map((v) => options.find((o) => o.value === v)?.label || humanize(v));
      return labels.join(', ');
    }
    if (value === undefined || value === null || value === '') return null;
    return options.find((o) => o.value === value)?.label || humanize(value);
  }, [multi, value, options]);

  return (
    <>
      <Pressable
        onPress={() => !blockedByParent && setOpen(true)}
        style={[styles.select, error && styles.inputError, blockedByParent && styles.disabled]}
      >
        <Text style={[styles.selectText, !display && styles.placeholder]} numberOfLines={1}>
          {blockedByParent
            ? `Select ${humanize(field.dependsOn)} first`
            : display || `Choose ${label.toLowerCase()}`}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.mutedLight} />
      </Pressable>
      <OptionSheet
        visible={open}
        title={label}
        options={options}
        value={value}
        multi={multi}
        searchable={isReference || options.length > 7}
        loading={loading}
        onClose={() => setOpen(false)}
        onChange={onChange}
      />
    </>
  );
}

function parseNumber(text, type) {
  const clean = text.replace(type === 'integer' ? /[^0-9-]/g : /[^0-9.-]/g, '');
  if (clean === '' || clean === '-') return undefined;
  const n = type === 'integer' ? parseInt(clean, 10) : parseFloat(clean);
  return Number.isNaN(n) ? undefined : n;
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.lg },
  label: { fontSize: typography.sizes.sm, fontWeight: typography.weight.semibold, color: colors.ink, marginBottom: spacing.sm },
  req: { color: colors.danger },
  unit: { color: colors.muted, fontWeight: typography.weight.regular },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    fontSize: typography.sizes.base,
    color: colors.ink,
    minHeight: 50,
  },
  textarea: { minHeight: 110, paddingTop: spacing.md },
  inputError: { borderColor: colors.danger },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 50,
  },
  disabled: { backgroundColor: colors.bg },
  selectText: { flex: 1, fontSize: typography.sizes.base, color: colors.ink },
  placeholder: { color: colors.mutedLight },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  switchHint: { fontSize: typography.sizes.base, color: colors.muted },
  moneyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 50,
  },
  moneyPrefix: { fontSize: typography.sizes.md, fontWeight: typography.weight.bold, color: colors.muted, marginRight: spacing.sm },
  moneyInput: { flex: 1, fontSize: typography.sizes.md, color: colors.ink, fontWeight: typography.weight.semibold },
  error: { color: colors.danger, fontSize: typography.sizes.xs, marginTop: 6 },
});
