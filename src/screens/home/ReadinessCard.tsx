import React from 'react';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { Card, Badge, Title, Body, ProgressBar } from '../../components/Themed';
import { Checkin } from '../../db/database';

interface Props {
  checkin: Checkin | null;
}

function readinessLevel(score: number): 'ready' | 'good' | 'tired' | 'rest' {
  if (score >= 80) return 'ready';
  if (score >= 60) return 'good';
  if (score >= 40) return 'tired';
  return 'rest';
}

export function ReadinessCard({ checkin }: Props) {
  const t = useTokens();
  const { t: i18n } = useLang();
  const h = i18n.home;

  if (!checkin) {
    return (
      <Card>
        <Badge variant="warning" style={{ alignSelf: 'flex-start', marginBottom: t.spacing.sm }}>
          {h.status_light}
        </Badge>
        <Title>{h.readiness_states.none.title}</Title>
        <Body style={{ marginTop: t.spacing.xs }}>{h.readiness_states.none.sub}</Body>
      </Card>
    );
  }

  const level = readinessLevel(checkin.readiness);
  const state = h.readiness_states[level];
  const badgeVariant = level === 'ready' || level === 'good' ? 'success' : level === 'tired' ? 'warning' : 'error';
  const badgeLabel = level === 'ready' ? h.status_ready : level === 'good' ? h.status_good : level === 'tired' ? h.status_light : h.status_rest;

  return (
    <Card>
      <Badge variant={badgeVariant} style={{ alignSelf: 'flex-start', marginBottom: t.spacing.sm }}>
        {badgeLabel}
      </Badge>
      <Title>{state.title}</Title>
      <Body style={{ marginTop: t.spacing.xs }}>{state.sub}</Body>
      <ProgressBar progress={checkin.readiness / 100} style={{ marginTop: t.spacing.inset }} />
      <Body style={{ marginTop: t.spacing.xs }}>{h.readiness} · {checkin.readiness}</Body>
    </Card>
  );
}
