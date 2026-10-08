import React from 'react';
import "./BookPage.css"

// Single Image Page Component
const BookPage = React.forwardRef((props, ref) => {
  const imageUrl = props.imageUrl.startsWith('http') ? props.imageUrl : `http://localhost:2406${props.imageUrl}`;
  return (
    <div className="demoPage" ref={ref}>
      <img 
        src={imageUrl} 
        alt={`Page ${props.number}`} 
        className="demo-page-image" 
      />
    </div>
  );
});

export default BookPage;