import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router';
import HTMLFlipBook from 'react-pageflip';
import api from '../utils/api';
import BookPage from '../components/BookPage';
import "../styles/BookReader.css";

const fetchUserId = () => {
    try {
        const token = localStorage.getItem("token")
        if (!token) return null

        const payload = token.split('.')[1]
        const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
        return decoded.userId
    } catch (error) {
        return null
    }
}

function BookReader() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const bookRef = useRef()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPageNum, setCurrentPageNum] = useState(0)

  useEffect(() => {
    const fetchBookAndProgress = async () => {
      try {
        const token = localStorage.getItem("token")
        const userId = fetchUserId()

        const bookResponse = await api.get(`/contents/${id}`)
        setBook(bookResponse.data)

        // Check if there's a URL query parameter like ?page=X coming from Profile
        const urlPageParam = searchParams.get("page")
        if (urlPageParam) {
          const parsedPage = parseInt(urlPageParam, 10) - 1 // convert 1-index to 0-index
          if (!isNaN(parsedPage) && parsedPage >= 0) {
            setCurrentPageNum(parsedPage)
            setLoading(false)
            return
          }
        }

        // Fallback: Fetch user bookmarks if no URL query param was provided
        if (token && userId) {
          const bookmarksResponse = await api.get(`/bookmarks`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const existingBookmark = bookmarksResponse.data.find(bookmark => (bookmark.contentId?._id || bookmark.contentId) === id)
          if (existingBookmark && (existingBookmark.lastReadPage || existingBookmark.lastPage)) {
            const savedPage = (existingBookmark.lastReadPage || existingBookmark.lastPage) - 1
            setCurrentPageNum(savedPage > 0 ? savedPage : 0)
          }
        }
      } catch (error) {
        console.error("Error fetching content details or progress:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBookAndProgress()
  }, [id, searchParams])

  const saveReadingProgress = useCallback(async (pageNumber) => { // save book page history
    try {
      const token = localStorage.getItem("token")
      const userId = fetchUserId()
      if (!token || !userId) return

      const pageToSave = pageNumber + 1 // convert 0-index to 1-index page
      await api.post("/bookmarks", {
        userId,
        contentId: id,
        lastReadPage: pageToSave
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch (error) {
      console.error("Failed to auto-save reading progress:", error)
    }
  }, [id])

  // Handle page flip from HTMLFlipBook
  const handlePageFlip = (flipEvent) => {
    const newPageNumber = flipEvent.data
    setCurrentPageNum(newPageNumber)
    saveReadingProgress(newPageNumber)
  }

  if (loading) return <div className="loading-text">Loading magazine pages...</div>
  if (!book) return <div className="loading-text">Content not found.</div>

  let pages = []
  if (Array.isArray(book.contentImageUrls) && book.contentImageUrls.length > 0) {
    pages = book.contentImageUrls
  } else if (typeof book.contentImageUrls === "string" && book.contentImageUrls.trim() !== "") {
    pages = book.contentImageUrls.split(",").map(imageUrl => imageUrl.trim())
  } else if (book.imageUrl) {
    pages = [book.imageUrl]
  } else if (book.pdfFileUrl) {
    pages = [book.pdfFileUrl]
  }

  const processedPages = [...pages]
  if (processedPages.length % 2 !== 0) {
    processedPages.push("END_PAGE_MARKER")
  }

  const totalItemsCount = processedPages.length
  const isLastPage = currentPageNum >= totalItemsCount - 2

  return (
    <div className="content-view-container">
      <div className="content-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to Bookshelf
        </button>
        <h2>{book.name}</h2>
      </div>

      <div className="reader-box">
        {pages.length > 0 ? (
          <HTMLFlipBook 
            width={400}            
            height={500}           
            size="fixed"
            minWidth={300}
            maxWidth={600}
            minHeight={400}
            maxHeight={800}
            maxSpeed={500}         
            flippingTime={800}     
            usePortrait={false}    
            startZIndex={0}
            autoSize={true}
            showCover={false}     
            drawShadow={true}      
            mobileScrollSupport={true}
            ref={bookRef}
            startPage={currentPageNum}
            onFlip={handlePageFlip}
            className="flip-book-container"
          >
            {processedPages.map((item, index) => {
              if (item === "END_PAGE_MARKER") {
                return (
                  <div key={`end-${index}`} className="end-page-marker">
                    <p className="end-page-text" onClick={() => navigate(-1)}>
                      End &rarr
                    </p>
                  </div>
                )
              }
              return <BookPage key={index} number={index + 1} imageUrl={item} />
            })}
          </HTMLFlipBook>
        ) : (
          <p className="error-msg">
            No pages available for this publication.
          </p>
        )}
      </div>

      {pages.length > 0 && (
        <div className="flip-controls">
          <div className="page-info-badge">
            Page {Math.min(currentPageNum + 1, pages.length)} of {pages.length}
          </div>
          <div className="control-buttons-group">
            {currentPageNum > 0 && (
              <button className="control-btn" onClick={() => bookRef.current?.pageFlip()?.flipPrev()}>
                ← Previous Spread
              </button>
            )}
            {!isLastPage && (
              <button className="control-btn" onClick={() => bookRef.current?.pageFlip()?.flipNext()}>
                Next Spread →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default BookReader