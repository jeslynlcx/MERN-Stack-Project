import React from 'react';
import { Box } from '@mui/material';

// Single Image Page Component
const BookPage = React.forwardRef((props, ref) => {
  const imageUrl = props.imageUrl.startsWith('http') ? props.imageUrl : `http://localhost:2406${props.imageUrl}`
  
  return (
    <Box 
      ref={ref} 
      sx={{ 
        backgroundColor: '#f0efef', 
        height: '100%', 
        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.1)' 
      }}
    >
      <Box 
        component="img"
        src={imageUrl} 
        alt={`Page ${props.number}`} 
        sx={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain' 
        }} 
      />
    </Box>
  )
})

export default BookPage