import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, typography, shadows } from '../theme/tokens';
import { taxonomy, listings } from '../api/endpoints';
import { categoryIcon, tintForIndex } from '../utils/icons';
import { formatPkr } from '../utils/format';
import DynamicField from '../components/DynamicField';
import LocationPicker from '../components/LocationPicker';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import { Skeleton } from '../components/Skeleton';
import { useAuth } from '../store/auth';

const PRICING_KEYS = new Set(['price', 'price_type', 'location_id', 'media']);
const STEPS = ['Category', 'Details', 'Price & photos', 'Review'];

export default function PostAdScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const authed = useAuth((s) => s.status === 'authed');

  const [step, setStep] = useState(0);
  const [catTree, setCatTree] = useState([]);
  const [catStack, setCatStack] = useState([]); // breadcrumb of non-leaf nodes
  const [category, setCategory] = useState(null);
  const [schema, setSchema] = useState(null);
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [values, setValues] = useState({});
  const [locationLabel, setLocationLabel] = useState(null);
  const [locOpen, setLocOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authed) taxonomy.categories().then((res) => setCatTree(res.items || [])).catch(() => {});
  }, [authed]);

  const currentLevel = catStack.length ? catStack[catStack.length - 1].children || [] : catTree;

  const pickCategory = async (node) => {
    if (node.children && node.children.length) {
      setCatStack((s) => [...s, node]);
      return;
    }
    // leaf
    setCategory(node);
    setSchemaLoading(true);
    setStep(1);
    try {
      const sch = await taxonomy.formSchema(node.id);
      setSchema(sch);
      // seed defaults
      const seed = {};
      [...(sch.commonFields || []), ...(sch.fields || [])].forEach((f) => {
        if (f.key === 'price_type' && f.options?.length) seed.price_type = f.options[0].value;
        if (f.key === 'media') seed.media = [];
      });
      setValues(seed);
    } catch (e) {
      Alert.alert('Error', 'Could not load the form for this category.');
      setStep(0);
    } finally {
      setSchemaLoading(false);
    }
  };

  const goBackCategory = () => {
    if (catStack.length) setCatStack((s) => s.slice(0, -1));
  };

  const detailFields = useMemo(() => {
    if (!schema) return [];
    const common = (schema.commonFields || []).filter((f) => f.key === 'title' || f.key === 'description');
    return [...common, ...(schema.fields || [])];
  }, [schema]);

  const pricingFields = useMemo(() => {
    if (!schema) return [];
    const order = ['price', 'price_type', 'location_id', 'media'];
    return (schema.commonFields || [])
      .filter((f) => PRICING_KEYS.has(f.key))
      .sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  }, [schema]);

  const setValue = (key) => (val) => {
    setValues((v) => ({ ...v, [key]: val }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const validateFields = (fields) => {
    const errs = {};
    fields.forEach((f) => {
      if (!f.required) return;
      const v = values[f.key];
      const empty =
        v === undefined ||
        v === null ||
        v === '' ||
        (Array.isArray(v) && v.length === 0);
      if (empty) errs[f.key] = `${f.label} is required`;
      if (f.key === 'media' && (!Array.isArray(v) || v.length < (f.validation?.minItems || 1))) {
        errs[f.key] = 'Add at least one photo';
      }
    });
    return errs;
  };

  const next = () => {
    const fields = step === 1 ? detailFields : pricingFields;
    const errs = validateFields(fields);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStep((s) => s + 1);
  };

  const back = () => {
    if (step === 0) navigation.goBack();
    else if (step === 1) {
      setStep(0);
      setSchema(null);
      setCategory(null);
    } else setStep((s) => s - 1);
  };

  const buildPayload = () => {
    const attributes = {};
    [...detailFields, ...pricingFields].forEach((f) => {
      if (['title', 'description', 'price', 'price_type', 'location_id', 'media'].includes(f.key)) return;
      if (values[f.key] !== undefined && values[f.key] !== '') attributes[f.key] = values[f.key];
    });
    return {
      categoryId: category.id,
      title: values.title,
      description: values.description,
      priceMinor: Number(values.price || 0),
      priceType: values.price_type || 'fixed',
      condition: attributes.condition || undefined,
      locationId: values.location_id,
      attributes,
      media: (values.media || []).map((m, i) => ({ url: m.url, sortOrder: i })),
    };
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const { listing, moderation } = await listings.create(buildPayload());
      const msg =
        moderation?.state === 'ACTIVE'
          ? 'Your ad is now live on Bazaario!'
          : 'Your ad was submitted and is pending a quick review.';
      Alert.alert('Ad posted', msg, [
        {
          text: 'View ad',
          onPress: () => {
            navigation.goBack();
            navigation.navigate('ListingDetail', { publicId: listing.publicId });
          },
        },
      ]);
    } catch (e) {
      if (e.fields) {
        setErrors(e.fields);
        // jump back to the step containing the first error
        const firstKey = Object.keys(e.fields)[0];
        if (PRICING_KEYS.has(firstKey)) setStep(2);
        else setStep(1);
      }
      Alert.alert('Could not post', e.message || 'Please check the form and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!authed) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <Header title="Post an ad" onClose={() => navigation.goBack()} />
        <EmptyState
          icon="lock-closed-outline"
          title="Sign in to post"
          message="You need an account to post ads on Bazaario. It only takes a few seconds."
          actionLabel="Sign in / Register"
          onAction={() => navigation.navigate('Login')}
        />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Header title="Post an ad" onClose={() => navigation.goBack()} onBack={step > 0 ? back : undefined} />

      {/* Progress */}
      <View style={styles.progress}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.progressItem}>
            <View style={[styles.dot, i <= step && styles.dotActive]}>
              {i < step ? (
                <Ionicons name="checkmark" size={13} color={colors.white} />
              ) : (
                <Text style={[styles.dotText, i <= step && styles.dotTextActive]}>{i + 1}</Text>
              )}
            </View>
            <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]} numberOfLines={1}>
              {label}
            </Text>
            {i < STEPS.length - 1 ? <View style={[styles.bar, i < step && styles.barActive]} /> : null}
          </View>
        ))}
      </View>

      {/* Step content */}
      {step === 0 ? (
        <CategoryStep
          level={currentLevel}
          stack={catStack}
          onBack={goBackCategory}
          onPick={pickCategory}
        />
      ) : schemaLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Loading form…</Text>
        </View>
      ) : (
        <>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
            {step === 1 ? (
              <FormStep
                title={category?.label}
                subtitle="Tell buyers about your item"
                fields={detailFields}
                values={values}
                errors={errors}
                setValue={setValue}
              />
            ) : null}
            {step === 2 ? (
              <FormStep
                title="Price, location & photos"
                subtitle="Set your price and add photos"
                fields={pricingFields}
                values={values}
                errors={errors}
                setValue={setValue}
                onPickLocation={() => setLocOpen(true)}
                locationLabel={locationLabel}
              />
            ) : null}
            {step === 3 ? <ReviewStep category={category} schema={schema} values={values} locationLabel={locationLabel} /> : null}
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            {step < 3 ? (
              <Button title="Continue" variant="primary" size="lg" iconRight="arrow-forward" onPress={next} full />
            ) : (
              <Button title="Post ad now" variant="accent" size="lg" icon="rocket-outline" onPress={submit} loading={submitting} full />
            )}
          </View>
        </>
      )}

      <LocationPicker
        visible={locOpen}
        onClose={() => setLocOpen(false)}
        onSelect={(loc) => {
          setValues((v) => ({ ...v, location_id: loc.id }));
          setLocationLabel(loc.path ? `${loc.name}, ${loc.path}` : loc.name);
          setErrors((e) => ({ ...e, location_id: undefined }));
        }}
      />
    </View>
  );
}

function Header({ title, onClose, onBack }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable hitSlop={8} onPress={onBack}>
          <Ionicons name="chevron-back" size={26} color={colors.ink} />
        </Pressable>
      ) : (
        <View style={{ width: 26 }} />
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      <Pressable hitSlop={8} onPress={onClose}>
        <Ionicons name="close" size={24} color={colors.muted} />
      </Pressable>
    </View>
  );
}

function CategoryStep({ level, stack, onBack, onPick }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }}>
      <Text style={styles.stepTitle}>{stack.length ? stack[stack.length - 1].label : 'Choose a category'}</Text>
      <Text style={styles.stepSub}>{stack.length ? 'Pick a subcategory' : 'What are you selling?'}</Text>

      {stack.length ? (
        <Pressable style={styles.breadcrumb} onPress={onBack}>
          <Ionicons name="arrow-back" size={16} color={colors.primary} />
          <Text style={styles.breadcrumbText}>Back to {stack.length > 1 ? stack[stack.length - 2].label : 'all categories'}</Text>
        </Pressable>
      ) : null}

      <View style={styles.catList}>
        {level.map((node, i) => (
          <Pressable key={node.id} style={({ pressed }) => [styles.catRow, pressed && styles.pressed]} onPress={() => onPick(node)}>
            <View style={[styles.catIcon, { backgroundColor: tintForIndex(i) }]}>
              <Ionicons name={categoryIcon(node.icon)} size={20} color={colors.ink} />
            </View>
            <Text style={styles.catLabel}>{node.label}</Text>
            <Ionicons name={node.children?.length ? 'chevron-forward' : 'add-circle'} size={20} color={node.children?.length ? colors.mutedLight : colors.primary} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function FormStep({ title, subtitle, fields, values, errors, setValue, onPickLocation, locationLabel }) {
  return (
    <View>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepSub}>{subtitle}</Text>
      {fields.map((field) => (
        <DynamicField
          key={field.key}
          field={field}
          value={values[field.key]}
          onChange={setValue(field.key)}
          error={errors[field.key]}
          form={values}
          onPickLocation={onPickLocation}
          locationLabel={locationLabel}
        />
      ))}
    </View>
  );
}

function ReviewStep({ category, schema, values, locationLabel }) {
  const allFields = [...(schema?.commonFields || []), ...(schema?.fields || [])];
  const rows = allFields
    .filter((f) => !['media', 'title', 'description'].includes(f.key))
    .map((f) => {
      let val = values[f.key];
      if (f.key === 'price') val = formatPkr(values.price || 0);
      else if (f.key === 'location_id') val = locationLabel || values.location_id;
      else if (Array.isArray(val)) val = val.join(', ');
      else if (f.options) val = f.options.find((o) => o.value === val)?.label || val;
      return { label: f.label, value: val };
    })
    .filter((r) => r.value !== undefined && r.value !== '' && r.value !== null);

  const media = values.media || [];

  return (
    <View>
      <Text style={styles.stepTitle}>Review your ad</Text>
      <Text style={styles.stepSub}>Make sure everything looks right before posting</Text>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewTitle}>{values.title || 'Untitled'}</Text>
        <Text style={styles.reviewPrice}>{formatPkr(values.price || 0)}</Text>
        <Text style={styles.reviewCategory}>{category?.label} · {media.length} photo{media.length === 1 ? '' : 's'}</Text>
        {values.description ? <Text style={styles.reviewDesc}>{values.description}</Text> : null}

        <View style={styles.reviewDivider} />
        {rows.map((r) => (
          <View key={r.label} style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>{r.label}</Text>
            <Text style={styles.reviewValue}>{String(r.value)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.noteBox}>
        <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
        <Text style={styles.noteText}>Ads are checked against our rules. Most go live instantly.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface },
  headerTitle: { fontSize: typography.sizes.md, fontWeight: typography.weight.bold, color: colors.ink },
  progress: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.line },
  progressItem: { flex: 1, alignItems: 'center', position: 'relative' },
  dot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.lineSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.line },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotText: { fontSize: typography.sizes.xs, color: colors.muted, fontWeight: typography.weight.bold },
  dotTextActive: { color: colors.white },
  stepLabel: { fontSize: 10, color: colors.mutedLight, marginTop: 4, fontWeight: typography.weight.medium },
  stepLabelActive: { color: colors.primary, fontWeight: typography.weight.bold },
  bar: { position: 'absolute', top: 11, left: '60%', right: '-40%', height: 2, backgroundColor: colors.line },
  barActive: { backgroundColor: colors.primary },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { color: colors.muted },
  form: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  stepTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weight.extrabold, color: colors.ink, letterSpacing: -0.4 },
  stepSub: { fontSize: typography.sizes.sm, color: colors.muted, marginTop: 4, marginBottom: spacing.lg },
  breadcrumb: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  breadcrumbText: { color: colors.primary, fontSize: typography.sizes.sm, fontWeight: typography.weight.semibold },
  catList: { gap: spacing.sm },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.md, ...shadows.soft },
  pressed: { opacity: 0.7 },
  catIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  catLabel: { flex: 1, fontSize: typography.sizes.base, color: colors.ink, fontWeight: typography.weight.semibold },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line, ...shadows.card },
  reviewCard: { backgroundColor: colors.surface, borderRadius: radius.card, padding: spacing.lg, ...shadows.card },
  reviewTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weight.bold, color: colors.ink },
  reviewPrice: { fontSize: typography.sizes.xl, fontWeight: typography.weight.extrabold, color: colors.primary, marginTop: 4 },
  reviewCategory: { fontSize: typography.sizes.xs, color: colors.muted, marginTop: 4 },
  reviewDesc: { fontSize: typography.sizes.sm, color: colors.ink, marginTop: spacing.md, lineHeight: 21 },
  reviewDivider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.md },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  reviewLabel: { fontSize: typography.sizes.sm, color: colors.muted, flex: 1 },
  reviewValue: { fontSize: typography.sizes.sm, color: colors.ink, fontWeight: typography.weight.semibold, flex: 1, textAlign: 'right' },
  noteBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primarySoft, padding: spacing.md, borderRadius: radius.md, marginTop: spacing.lg },
  noteText: { flex: 1, fontSize: typography.sizes.xs, color: colors.primaryDark, lineHeight: 18 },
});
