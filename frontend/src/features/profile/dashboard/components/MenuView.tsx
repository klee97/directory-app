"use client";

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { Section, SectionIcon } from './Section';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import NavigationMenu from '@/components/layouts/NavigationMenu';

interface MenuViewProps {
  sections: Section[];
  completedSections: string[];
  inProgressSections: string[];
  onSectionClick: (id: string) => void;
  onPublish: () => void;
  hasUnpublishedChanges: boolean;
}

export default function MenuView({
  sections,
  completedSections,
  inProgressSections,
  onSectionClick,
  onPublish,
  hasUnpublishedChanges,
}: MenuViewProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Edit your artist profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add more details below to make it shine, and hit &quot;Publish&quot; when you&apos;re ready.
        </Typography>
        {hasUnpublishedChanges && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You have unpublished changes.
          </Alert>
        )}
        <Button variant="contained" fullWidth onClick={onPublish} sx={{ borderRadius: 2 }} disabled={!hasUnpublishedChanges}>
          Publish
        </Button>
      </Box>

      {/* Sections list */}
      <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
        {sections.map((section) => {
          const isComplete = completedSections.includes(section.id);
          const isInProgress = inProgressSections.includes(section.id);
          const status: 'complete' | 'inProgress' | 'empty' =
            isComplete ? 'complete' : isInProgress ? 'inProgress' : 'empty';

          const labelColor =
            status === 'complete'
              ? 'success.main'
              : status === 'inProgress'
                ? 'text.secondary'
                : 'text.disabled';

          const secondaryText =
            status === 'complete'
              ? 'Complete'
              : status === 'inProgress'
                ? 'In progress'
                : 'Not started';

          return (
            <ListItem key={section.id} disablePadding>
              <ListItemButton
                divider={true}
                onClick={() => onSectionClick(section.id)}
              >
                <Box sx={{ mr: 2 }}>
                  <SectionIcon status={status} />
                </Box>
                <ListItemText
                  primary={section.label}
                  secondary={secondaryText}
                  slotProps={{
                    secondary: { color: labelColor },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Navigation options (visible on mobile) */}
      {isMobile && (
        <>
          <Divider />
          <List sx={{ py: 1 }}>
            <NavigationMenu isVendorNavbar={true} variant="list" />
          </List>
        </>
      )}
    </Box>
  );
}