import React from 'react';
import { View, Text } from 'react-native';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { Card, Overline, Title, Body, PrimaryButton } from '../../components/Themed';
import { AIModuleState } from '../../hooks/useAIModule';
import { RecommendationType } from '../../engine/aiRecommendation';

function intensityColor(t: ReturnType<typeof useTokens>, pct: number): string {
  if (pct >= 75) return t.colorPrimary;
  if (pct >= 40) return t.colorWarning;
  return t.colorError;
}

function intensityBadgeLabel(t: ReturnType<typeof useTokens>, type: RecommendationType | null, i18n: ReturnType<typeof useLang>['t']): { label: string; color: string } {
  const w = i18n.workout.ai_module;
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

  // ── Downloading ─────────────────────────────────────────────────────────────
  if (module.isDownloading) {
    const pct = Math.round(module.progress);
    return (
      <Card>
        <Overline style={{ marginBottom: t.spacing.sm }}>{w.overline}</Overline>
        <Body style={{ marginBottom: t.spacing.inset }}>{w.downloading}</Body>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
          <View style={{ flex: 1, height: 6, backgroundColor: t.bgSubtle, borderRadius: t.radius.xs, overflow: 'hidden' }}>
            <View style={{ width: `${pct}%`, height: '100%', backgroundColor: t.colorPrimary, borderRadius: t.radius.xs }} />
          </View>
          <Text style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: t.textTertiary, minWidth: 32, textAlign: 'right' }}>
            {pct}%
          </Text>
        </View>
      </Card>
    );
  }

  // ── Not downloaded ───────────────────────────────────────────────────────────
  if (!module.isDownloaded) {
    return (
      <Card>
        <Overline style={{ marginBottom: t.spacing.sm }}>{w.overline}</Overline>
        <Title style={{ marginBottom: t.spacing.xs }}>{w.download_title}</Title>
        <Body style={{ marginBottom: t.spacing.inset }}>{w.download_sub}</Body>
        <PrimaryButton onPress={module.download}>{w.download_btn}</PrimaryButton>
      </Card>
    );
  }

  // ── Downloaded: show recommendation ─────────────────────────────────────────
  const recType = module.recommendationType;
  const rec = recType ? w.recs[recType] : null;
  const badge = intensityBadgeLabel(t, recType, i18n);
  const pct = module.intensityPercent;
  const barColor = pct === 0 ? t.borderDefault : intensityColor(t, pct);

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

      {rec && (
        <>
          <Title style={{ marginBottom: t.spacing.xs }}>{rec.title}</Title>
          <Body style={{ marginBottom: t.spacing.inset }}>{rec.body}</Body>
        </>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.sm }}>
        <View style={{ flex: 1, height: 6, backgroundColor: t.bgSubtle, borderRadius: t.radius.xs, overflow: 'hidden' }}>
          <View style={{ width: `${pct}%`, height: '100%', backgroundColor: barColor, borderRadius: t.radius.xs }} />
        </View>
        <Text style={{ fontSize: t.font.size.xs, fontWeight: t.font.weight.semibold, color: t.textTertiary, minWidth: 32, textAlign: 'right' }}>
          {pct}%
        </Text>
      </View>
      <Text style={{ fontSize: t.font.size.xs, color: t.textTertiary, marginTop: t.spacing.xxs }}>
        {w.intensity_label}
      </Text>
    </Card>
  );
}
