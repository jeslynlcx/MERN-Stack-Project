// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router";
// import { Document, Page, pdfjs } from "react-pdf";
// import api from "../utils/api";
// import Navbar from "../components/Navbar";
// import "./book.css";

// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

// function BookReader() {
//     const { id } = useParams();
//     const navigate = useNavigate();

//     const [book, setBook] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [numPages, setNumPages] = useState(null);
//     const [currentPage, setCurrentPage] = useState(1);

//     useEffect(() => {
//         const fetchBookDetails = async () => {
//             try {
//                 const response = await api.get(`/contents/${id}`);
//                 setBook(response.data);
//             } catch (error) {
//                 console.error("Error fetching book details for reader:", error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchBookDetails();
//     }, [id]);

//     const onDocumentLoadSuccess = ({ numPages }) => {
//         setNumPages(numPages);
//     };

//     const handlePrevPage = () => {
//         setCurrentPage((prev) => Math.max(prev - 1, 1));
//     };

//     const handleNextPage = () => {
//         setCurrentPage((prev) => Math.min(prev + 1, numPages || prev));
//     };

//     return (
//         <div className="reader-page-wrapper">
//             <Navbar />

//             <div className="reader-workspace">
//                 <div className="reader-toolbar">
//                     <button className="back-shelf-btn" onClick={() => navigate("/cabinet")}>
//                         ← Back to Bookshelf
//                     </button>
                    
//                     <div className="reader-title-info">
//                         <h2>{book ? book.name : "Loading Publication..."}</h2>
//                         <span className="reader-page-indicator">
//                             Page <strong>{currentPage}</strong> of <strong>{numPages || "--"}</strong>
//                         </span>
//                     </div>

//                     <div className="reader-actions">
//                         <button 
//                             className="toolbar-nav-btn" 
//                             onClick={handlePrevPage}
//                             disabled={currentPage <= 1}
//                         >
//                             ← Previous Page
//                         </button>
//                         <button 
//                             className="toolbar-nav-btn" 
//                             onClick={handleNextPage}
//                             disabled={currentPage >= numPages}
//                         >
//                             Next Page →
//                         </button>
//                     </div>
//                 </div>

//                 <div className="card-reader-display-area">
//                     {loading ? (
//                         <div className="reader-status">Loading publication vault...</div>
//                     ) : !book?.pdfFileUrl ? (
//                         <div className="reader-status">Error: PDF file URL is missing for this record.</div>
//                     ) : (
//                         <div className="card-slide-container">
//                             <Document
//                                 file={book.pdfFileUrl}
//                                 onLoadSuccess={onDocumentLoadSuccess}
//                                 loading={<div className="reader-status">Downloading and rendering PDF document...</div>}
//                                 error={<div className="reader-status">Failed to load PDF from link. Please verify the URL.</div>}
//                             >
//                                 {numPages && (
//                                     <div className="pdf-card-wrapper" onClick={handleNextPage}>
//                                         <Page 
//                                             pageNumber={currentPage} 
//                                             width={500} 
//                                             renderTextLayer={false}
//                                             renderAnnotationLayer={false}
//                                             className="single-pdf-card"
//                                         />
//                                     </div>
//                                 )}
//                             </Document>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default BookReader;