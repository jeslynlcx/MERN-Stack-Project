import React from 'react';
import { Box } from '@mui/material';

const BookPage = React.forwardRef((props, ref) => {  //for page-flip animations and libraries that need direct DOM access to measure and turn pages[cite: 8]
  const imageUrl = props.imageUrl.startsWith('http') ? props.imageUrl : `http://localhost:2406${props.imageUrl}`
  
  return (
    <Box 
      ref={ref} 
      sx={{ 
        backgroundColor: '#000', 
        width: '100%',
        height: '100%', 
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        display: 'flex'
      }}
    >
      <Box 
        component="img"
        src={imageUrl} 
        alt={`Page ${props.number}`}
        sx={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'fill', // Forces the image to completely fill the entire width and height of the page
          display: 'block'
        }} 
      />
    </Box>
  )
})

export default BookPage