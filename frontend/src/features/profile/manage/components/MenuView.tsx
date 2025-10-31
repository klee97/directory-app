"use client";

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import SectionIcon from './SectionIcon';

interface Section {
  id: string;
  label: string;
  required?: boolean;
}

interface MenuViewProps {
  sections: Section[];
  completedSections: string[];
  onSectionClick: (id: string) => void;
  onPublish: () => void;
}

export default function MenuView({ sections, completedSections, onSectionClick, onPublish }: MenuViewProps) {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Edit your artist profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You have <strong>5 required sections</strong> to complete before you can publish your listing.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Completing the optional sections is a great way to add more details to your profile.
        </Typography>
        <Button
          variant="contained"
          fullWidth
          onClick={onPublish}
          sx={{ borderRadius: 2 }}
        >
          Publish
        </Button>
      </Box>

      <List sx={{ flexGrow: 1, overflow: 'auto', py: 0 }}>
        {sections.map((section) => (
          <ListItem
            key={section.id}
            disablePadding
          >
            <ListItemButton onClick={() => onSectionClick(section.id)}>
              <Box sx={{ mr: 2 }}>
                <SectionIcon
                  completed={completedSections.includes(section.id)}
                  required={!!section.required}
                  inProgress={section.required && !completedSections.includes(section.id)}
                />
              </Box>
              <ListItemText
                primary={section.label}
                secondary={
                  completedSections.includes(section.id)
                    ? 'Complete'
                    : section.required
                      ? 'Required'
                      : 'Optional'
                }
                slotProps={{
                  secondary: {
                    color: completedSections.includes(section.id)
                      ? 'success.main'
                      : section.required && !completedSections.includes(section.id)
                        ? 'error.main'
                        : 'text.secondary'
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
