import {
  decisionScoreToSemantic,
  STATUS_ICON_CLASSES,
  STATUS_ACCENT_BORDER_CLASSES,
  STATUS_TEXT_SAFE_CLASSES,
} from '../../theme/statusColors';
import { ICON_PATHS } from '../../theme/statusIcons';
import type { DecisionScore } from '../../types/decision';

/**
 * DecisionFactorRow — één factor-rij uit de factoranalyse van de
 * DecisionSupportCard (vierde puur-Tailwind component, volgt het #172-sjabloon).
 * Rendert één DecisionScore als omlijnde neutrale rij: status-icoon (inline
 * SVG, currentColor, gevuld uit statusIcons.ts) + factornaam + waarde/eenheid +
 * omlijnde score-chip, met drempel + uitleg eronder. De kaart-shell, de vier
 * MUI-Alerts en de knop blijven MUI (uitgesteld) — alleen deze rij migreert.
 *
 * LANDT DIVERGENTIE-1: de factor-score-kleuren verhuizen van het gedempte
 * triadje (#3b6d11/#ba7517/#a32d2d) naar de canonieke success/warning/danger —
 * icoon de levendige -600 (STATUS_ICON_CLASSES), chip-rand -600
 * (STATUS_ACCENT_BORDER_CLASSES), chip-tekst -700 (STATUS_TEXT_SAFE_CLASSES).
 * De 0.65rem-chiptekst (=text-2xs) is precies dé sub-AA-casus waarvoor de
 * text-safe-export is gemaakt: nu AA-leesbaar op het kale vlak.
 *
 * Iconen zijn de GEVULDE set uit statusIcons.ts (good→check-circle,
 * acceptable→driehoek, poor→error-cirkel) — gedeeld met StatusPill/ErrorCodeRow,
 * één iconentaal over alle migraties (was outline in de MUI-versie).
 *
 * Neutrale tekst/vlakken volgen de slate-rolmap uit tailwind.config.js
 * (text.primary→slate-900/50, text.secondary→slate-600/400, divider→
 * slate-200/overlay-12, paper→white/slate-800) — eerste gebruik van de
 * neutrale rolmap in een gemigreerd component. Styling via seam-literals
 * (JIT-veto), géén @mui/*.
 */

const factorScoreLabel: Record<DecisionScore['score'], string> = {
  good: 'Goed',
  acceptable: 'Acceptabel',
  poor: 'Onvoldoende',
};

interface Props {
  detail: DecisionScore;
}

const DecisionFactorRow = ({ detail }: Props) => {
  const semantic = decisionScoreToSemantic(detail.score);

  return (
    <div
      data-testid="decision-factor"
      data-semantic={semantic}
      className="rounded border border-slate-200 bg-white p-3 dark:border-overlay-12 dark:bg-slate-800"
    >
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            focusable="false"
            className={`shrink-0 ${STATUS_ICON_CLASSES[semantic]}`}
          >
            <path d={ICON_PATHS[semantic]} />
          </svg>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            {detail.factor}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {detail.value}{detail.unit ? ` ${detail.unit}` : ''}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-1.5 py-px text-2xs ${STATUS_ACCENT_BORDER_CLASSES[semantic]} ${STATUS_TEXT_SAFE_CLASSES[semantic]}`}
          >
            {factorScoreLabel[detail.score]}
          </span>
        </div>
      </div>
      <span className="mb-0.5 block text-xs text-slate-600 dark:text-slate-400">
        Drempel: {detail.threshold}
      </span>
      <span className="block text-xs text-slate-900 dark:text-slate-50">
        {detail.explanation}
      </span>
    </div>
  );
};

export default DecisionFactorRow;
