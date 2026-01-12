import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import Skeleton from "@mui/material/Skeleton";

const DRAWER_WIDTH = 400;
const TOOLBAR_HEIGHT = 64; // Standard MUI toolbar height

export default function VendorEditSkeleton() {
  return (
    <>
      <Toolbar />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
              top: TOOLBAR_HEIGHT, // Use constant instead of function
              height: `calc(100% - ${TOOLBAR_HEIGHT}px)`, // Use template literal instead of function
              bgcolor: 'background.paper',
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Skeleton variant="text" width="60%" height={48} sx={{ mb: 3 }} />
            
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Box key={i} sx={{ mb: 2 }}>
                <Skeleton 
                  variant="rectangular" 
                  height={60} 
                  sx={{ borderRadius: 1, bgcolor: 'action.hover' }} 
                />
              </Box>
            ))}
            
            <Skeleton 
              variant="rectangular" 
              height={48} 
              sx={{ borderRadius: 1, mt: 4, bgcolor: 'primary.main', opacity: 0.3 }} 
            />
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'grey.200' }}>
            <Box sx={{ 
              bgcolor: 'grey.500', 
              py: 1.5, 
              px: 3, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Skeleton variant="text" width={300} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
            </Box>

            <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
              <Box sx={{ 
                bgcolor: 'background.default', 
                borderRadius: 2, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                p: 2 
              }}>
                <Skeleton 
                  variant="rectangular" 
                  height={300} 
                  sx={{ borderRadius: 1, mb: 3, bgcolor: 'action.hover' }} 
                />
                
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Skeleton variant="circular" width={80} height={80} sx={{ bgcolor: 'action.hover' }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="60%" height={22} />
                    <Skeleton variant="text" width="30%" height={22} />
                  </Box>
                </Box>

                <Skeleton 
                  variant="rectangular" 
                  height={150} 
                  sx={{ borderRadius: 1, mb: 2, bgcolor: 'action.hover' }} 
                />
                <Skeleton 
                  variant="rectangular" 
                  height={200} 
                  sx={{ borderRadius: 1, mb: 2, bgcolor: 'action.hover' }} 
                />
                <Skeleton 
                  variant="rectangular" 
                  height={120} 
                  sx={{ borderRadius: 1, bgcolor: 'action.hover' }} 
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}