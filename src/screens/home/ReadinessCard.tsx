import React from 'react';
import { useTokens } from '../../hooks/useTokens';
import { useLang } from '../../context/LanguageContext';
import { Card, Badge, Title, Body, Caption, ProgressBar } from '../../components/Themed';

export function ReadinessCard() {
  const t = useTokens();
  const { t: i18n } = useLang();
  const h = i18n.home;

  return (
    <Card>
      <Badge variant="success" style={{ alignSelf: 'flex-start', marginBottom: t.spacing.sm }}>
        {h.status_ready}
      </Badge>
      <Title>{h.fully_recovered}</Title>
      <Body style={{ marginTop: 4 }}>{h.push_today}</Body>
      <ProgressBar progress={0.92} style={{ marginTop: 12 }} />
      <Caption style={{ marginTop: 4 }}>{h.readiness} · 92</Caption>
    </Card>
  );
}
