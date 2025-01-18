import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

export const VendorCard = ({
  cardData: { img, tag, title, description },
  variant,
  onFocus,
  onBlur,
  tabIndex,
  className,
}: {
  variant: any;
  onFocus: () => void;
  onBlur: () => void;
  tabIndex: number;
  className: string;
  cardData: {
    img: string;
    tag: string;
    title: string;
    description: string;
    authors: { name: string; avatar: string }[];
  };
}) => {
  return (
    <Card
      variant={variant}
      onFocus={onFocus}
      onBlur={onBlur}
      tabIndex={tabIndex}
      className={className}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        height: '100%',
        backgroundColor: 'background.paper',
        '&:hover': {
          backgroundColor: 'transparent',
          cursor: 'pointer',
        },
        '&:focus-visible': {
          outline: '3px solid',
          outlineColor: 'hsla(210, 98%, 48%, 0.5)',
          outlineOffset: '2px',
        },
      }}
    >
      <CardMedia
        component="img"
        alt="green iguana"
        image={img}
        sx={{
          aspectRatio: '16 / 9',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      />
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          padding: 16,
          flexGrow: 1,
          '&:last-child': {
            paddingBottom: 16,
          },
        }}
      >
        <Typography gutterBottom variant="caption" component="div">
          {tag}
        </Typography>
        <Typography gutterBottom variant="h6" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};
