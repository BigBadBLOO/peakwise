import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { Card, Overline, Title, Body, PrimaryButton, SecondaryButton } from '../../components/Themed';
import { AIModuleState } from '../../hooks/useAIModule';
import { RecommendationType } from '../../engine/aiRecommendation';

const MODEL_SIZE = '~1.1 GB';

function intensityBarColor(t: ReturnType<typeof useTokens>, pct: number): string {
  if (pct >= 75) return t.colorPrimary;
  if (pct >= 40) return t.colorWarning;
  if (pct > 0)   return t.colorError;
  return t.borderDefault;
}

function badgeForIntensity(
  t: ReturnType<typeof useTokens>,
  type: RecommendationType | null,
): { label: string; color: string } {
  switch (type) {
    case 'full_send':     return { label: 'HIGH',     color: t.colorPrimary };
    case 'solid_session': return { label: 'MODERATE', color: t.colorPrimary };
    case 'go_light':      return { label: 'LIGHT',    color: t.colorWarning };
    case 'swap_rest':
    case 'rest_day':      return { label: 'REST',     color: t.colorError };
    default:              return { label: 'AI',       color: t.textTertiary };
  }
}

interface Props {
  module: AIModuleState;
}

export function RecommendationCard({ module }: Props) {
  const t = useTokens();
  const { t: i18n } = useLang();
  const w = i18n.workout.ai_module;

  const { status, progress, recommendation, errorMessage, download } = module;

  // ── Downloading ─────────────────────────────────────────────────────────────
  if (status === 'downloading') {
    const pct = Math.round(progress);
    return (
      <Card>
        <Overline style={{ marginBottom: t.spacing.sm }}>{w.overline}</Overline>
        <Body style={{ marginBottom: t.spacing.inset }}>{w.downloading}</Body>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
          <View style={{ flex: 1, height: 6, backgroundColor: t.bgSubtle, borderRadius: t.radius.xs, overflow: 'hidden' }}>
            <View style={{ width: `${pct}%`, height: '100%', backgroundColor: t.colorPrimary, borderRadius: t.radius.xs }} />
          </View>
          <Text style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: t.textTertiary, minWidth: 36, textAlign: 'right' }}>
            {pct}%
          </Text>
        </View>
      </Card>
    );
  }

  // ── Loading model into memory ────────────────────────────────────────────────
  if (status === 'loading_model') {
    return (
      <Card>
        <Overline style={{ marginBottom: t.spacing.sm }}>{w.overline}</Overline>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
          <ActivityIndicator size="small" color={t.colorPrimary} />
          <Body>{w.loading_model}</Body>
        </View>
      </Card>
    );
  }

  // ── Inferring ────────────────────────────────────────────────────────────────
  if (status === 'inferring') {
    return (
      <Card>
        <Overline style={{ marginBottom: t.spacing.sm }}>{w.overline}</Overline>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
          <ActivityIndicator size="small" color={t.colorPrimary} />
          <Body>{w.inferring}</Body>
        </View>
      </Card>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <Card>
        <Overline style={{ marginBottom: t.spacing.sm }}>{w.overline}</Overline>
        <Body style={{ color: t.colorError, marginBottom: t.spacing.inset }}>{errorMessage ?? w.error_generic}</Body>
        <SecondaryButton onPress={download}>{w.retry}</SecondaryButton>
      </Card>
    );
  }

  // ── Ready: AI recommendation ─────────────────────────────────────────────────
  if (status === 'ready' && recommendation) {
    const rec = recommendation;
    const badge = badgeForIntensity(t, rec.intensity);
    const pct = module.intensityPercent ?? 0;
    const barColor = intensityBarColor(t, pct);

    // title / explanation: use AI output if non-empty, else fall back to i18n
    const displayTitle = rec.title || (w.recs[rec.intensity]?.title ?? '');
    const displayBody  = rec.explanation || (w.recs[rec.intensity]?.body ?? '');

    return (
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing.sm }}>
          <Overline>{w.overline}</Overline>
          <View style={{ backgroundColor: badge.color + '22', paddingHorizontal: t.spacing.sm, paddingVertical: t.spacing.xxs, borderRadius: t.radius.tag }}>
            <Text style={{ fontSize: t.font.size.xxs, fontWeight: t.font.weight.bold, color: badge.color, letterSpacing: t.font.tracking.wider }}>
              {badge.label}
            </Text>
          </View>
        </View>

        <Title style={{ marginBottom: t.spacing.xs }}>{displayTitle}</Title>
        <Body style={{ marginBottom: t.spacing.inset }}>{displayBody}</Body>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
          <View style={{ flex: 1, height: 6, backgroundColor: t.bgSubtle, borderRadius: t.radius.xs, overflow: 'hidden' }}>
            <View style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: t.radius.xs }} />
          </View>
          <Text style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: t.textTertiary, minWidth: 36, textAlign: 'right' }}>
            {pct}%
          </Text>
        </View>
        <Text style={{ fontSize: t.font.size.xs, color: t.textTertiary, marginTop: t.spacing.xxs }}>
          {w.intensity_label}
        </Text>
      </Card>
    );
  }

  // ── Idle: prompt to download ─────────────────────────────────────────────────
  return (
    <Card>
      <Overline style={{ marginBottom: t.spacing.sm }}>{w.overline}</Overline>
      <Title style={{ marginBottom: t.spacing.xs }}>{w.download_title}</Title>
      <Body style={{ marginBottom: t.spacing.inset }}>{w.download_sub}</Body>
      <PrimaryButton onPress={download}>{w.download_btn(MODEL_SIZE)}</PrimaryButton>
    </Card>
  );
}
