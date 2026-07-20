import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Menu, Wifi, FlaskConical, Moon, Sun, Wrench, LineChart } from 'lucide-react';
import { Button } from '../ui/button';
import { Chip } from '../ui/chip';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { useDataSource } from '../../hooks/useDataSource';
import { useColorMode } from '../../context/ColorModeContext';
import { useRole } from '../../context/RoleContext';

/**
 * Cluster C1 (Tier-1-run): AppBar/Toolbar → flat <header>, IconButtons →
 * ghost-icon-Buttons, datasource-Chip → interactieve owned Chip, rol-
 * ToggleButtonGroup → owned ToggleGroup, Tooltip → native title.
 * Typography/Box blijven MUI (Tier 2). Gemeten tegen develop (licht+donker):
 * toolbar 64px/px-24/gap-16; chip 24px met 13px-label (→ text-sm-override
 * op de 2xs-basis); toggle-items 22.8px (py-0.5 + text-xs + leading-[1.4]);
 * themaknop 30px rond; menuknop 40px rond, alléén <md (900, C0-breakpoints).
 * Bewuste rebrands (precedenten): selectie-tekst old-MUI #1E3A5F → TNO
 * text-primary (#178); divider-randen → border-border-token (#180);
 * action.selected → slate-200/overlay-12-rolmap; interactieve elementen
 * Lato via de scoped reset (#178).
 */

interface HeaderProps {
  /** Opens the temporary sidebar drawer; only rendered below md. */
  onMenuClick?: () => void;
}

/* Rol-item: gemeten fideliteits-overrides op de segmented-basis (h-auto want
 * de gemeten hoogte volgt uit py+leading) + de TNO-selectietekst. */
const ROLE_ITEM_CLASSES =
  'h-auto px-2.5 py-0.5 text-xs leading-[1.4] font-bold ' +
  'aria-pressed:text-primary dark:aria-pressed:text-primary';

const Header = ({ onMenuClick }: HeaderProps) => {
  // The data-source read/toggle now lives in useDataSource (no direct service
  // import). Toggling triggers a refetch via useDashboardData's own subscription.
  const { dataSource: source, toggle: handleToggle } = useDataSource();
  const { mode, toggleColorMode } = useColorMode();
  const { role, setRole } = useRole();

  /* border-0 EERST in de header-class: border-solid zet álle zijden solid, en
     zonder Preflight materialiseert de UA-initial 'medium' (3px) op de
     niet-gezette zijden — de #198-les gespiegeld voor enkelzijdige randen
     (de geometrie-meting ving 'm: header 68px i.p.v. 65px). */
  return (
    <header className="border-0 border-b border-solid border-border bg-card">
      <div className="flex min-h-16 items-center gap-4 px-4 sm:px-6">
        <Button
          variant="ghost"
          size="icon"
          aria-label="menu"
          onClick={onMenuClick}
          className="md:hidden mr-2 shrink-0 p-0 rounded-full text-slate-600 dark:text-slate-400 [&_svg]:size-6"
        >
          <Menu />
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ lineHeight: 1.2 }}>
            Installateursportaal
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Hupie API via Heatpump Common Ontology
          </Typography>
        </Box>
        <Chip
          data-testid="datasource-chip"
          color={source === 'live' ? 'healthy' : 'warning'}
          icon={source === 'live' ? <Wifi size={18} /> : <FlaskConical size={18} />}
          onClick={handleToggle}
          className="text-sm"
        >
          {source === 'live' ? 'Hupie API (live)' : 'Mock data'}
        </Chip>
        <ToggleGroup
          value={role}
          onValueChange={(next) => {
            if (next === 'installateur' || next === 'beheerder') {
              setRole(next);
            }
          }}
          aria-label="Rolselectie"
        >
          <ToggleGroupItem
            value="installateur"
            aria-label="Installateur"
            data-testid="role-installateur"
            className={ROLE_ITEM_CLASSES}
          >
            <Wrench size={14} className="mr-1" />
            Installateur
          </ToggleGroupItem>
          <ToggleGroupItem
            value="beheerder"
            aria-label="Beheerder"
            data-testid="role-beheerder"
            className={ROLE_ITEM_CLASSES}
          >
            <LineChart size={14} className="mr-1" />
            Beheerder
          </ToggleGroupItem>
        </ToggleGroup>
        {/* aria-label: icoon-knop heeft geen toegankelijke NAAM uit het icoon
            (de title is een beschrijving) — a11y behouden; de testid is de
            stabiele selector voor de dark-mode e2e. */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleColorMode}
          aria-label="Thema wisselen"
          data-testid="theme-toggle"
          title={mode === 'dark' ? 'Licht thema' : 'Donker thema'}
          className="h-[30px] w-[30px] shrink-0 p-0 rounded-full text-slate-600 dark:text-slate-400 [&_svg]:size-5"
        >
          {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
      </div>
    </header>
  );
};

export default Header;
