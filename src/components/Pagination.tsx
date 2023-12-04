import { useEffect, useState } from "react";

interface PaginationProps {
  readonly postsPerPage: number;
  readonly totalPosts: number;
  readonly currentPage: any;
  readonly setCurrentPage: (value: any) => void;
}

function Pagination({ postsPerPage, totalPosts, currentPage, setCurrentPage }: PaginationProps) {
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const pageNumbers: any[] = [];

  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  const [arrOfCurrentButtons, setArrOfCurrentButtons] = useState<any>([]);

  useEffect(() => {
    let numberOfPages = [...pageNumbers];
    const dotsInitial = "...";
    const dotsLeft = "...  ";
    const dotsRight = "  ...";

    if (pageNumbers.length > 6) {
      if (currentPage >= 1 && currentPage <= 3) {
        // 1, 2, 3 ,4 ... , 10
        numberOfPages = [1, 2, 3, 4, dotsInitial, pageNumbers.length];
      } else if (currentPage === 4) {
        // sliced =[1,2,3,4,5]
        const sliced = pageNumbers.slice(0, 5);
        numberOfPages = [...sliced, dotsInitial, pageNumbers.length];
      } else if (currentPage > 4 && currentPage < pageNumbers.length - 2) {
        const sliced1 = pageNumbers.slice(currentPage - 2, currentPage);
        const sliced2 = pageNumbers.slice(currentPage, currentPage + 1);
        // 1, ... , 4, 5, 6, 7, ... , 10
        numberOfPages = [1, dotsLeft, ...sliced1, ...sliced2, dotsRight, pageNumbers.length];
      } else if (currentPage > pageNumbers.length - 3) {
        const sliced = pageNumbers.slice(pageNumbers.length - 4);
        numberOfPages = [1, dotsLeft, ...sliced];
      } else if (currentPage === dotsInitial) {
        // when click on dotsInitial it will show the next 3 pages
        setCurrentPage(arrOfCurrentButtons[arrOfCurrentButtons.length - 3] + 1);
      } else if (currentPage === dotsRight) {
        // when click on dotsRight it will show the clicked page + 2
        setCurrentPage(arrOfCurrentButtons[3] + 2);
      } else if (currentPage === dotsLeft) {
        // when click on dotsLeft it will show the the clicked page - 2
        setCurrentPage(arrOfCurrentButtons[3] - 2);
      }
    }
    // how many pages will be shown
    setArrOfCurrentButtons(numberOfPages);
  }, [totalPosts, currentPage, postsPerPage]);

  if (!pageNumbers.length) return null;

  return (
    <nav>
      <ul className="pagination">
        <li className="page-item">
          <button
            aria-label="link previous"
            className={currentPage === 1 ? `disabled page-link` : `page-link`}
            onClick={() => setCurrentPage((prev: number) => (prev === 1 ? prev : prev - 1))}
          >
            &larr;
          </button>
        </li>
        {arrOfCurrentButtons.map((number: number) => (
          <li key={number} className="page-item">
            <button
              onClick={() => paginate(number)}
              className={currentPage === number ? `active page-link` : `page-link`}
            >
              {number}
            </button>
          </li>
        ))}
        <li className="page-item">
          <button
            aria-label="link next"
            className={currentPage === pageNumbers.length ? `disabled page-link` : `page-link`}
            onClick={() => setCurrentPage((prev: number) => (prev === pageNumbers.length ? prev : prev + 1))}
          >
            &rarr;
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Pagination;
