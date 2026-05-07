import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ReactPaginate from 'react-paginate';
import { useQuery, keepPreviousData } from '@tanstack/react-query'; // Імпортуємо необхідне

import styles from './App.module.css';
import SearchBar from '../SearchBar/SearchBar';
import MovieGrid from '../MovieGrid/MovieGrid';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import MovieModal from '../MovieModal/MovieModal';
import { fetchMovies } from '../../services/movieService';
import type { Movie } from '../../types/movie';
import css from '../Pagination/Pagination.module.css';

const Paginate = (ReactPaginate as unknown as { default: any }).default || ReactPaginate;

function App() {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const {
    data,
    isLoading,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ['movies', query, page], 
    queryFn: () => fetchMovies(query, page),
    enabled: query.trim() !== '', 
    placeholderData: keepPreviousData, 
    retry: 1,
  });

  useEffect(() => {
    if (isSuccess && data?.results.length === 0) {
      toast.error("No movies found for your request.");
    }
  }, [isSuccess, data]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  };

  const handlePageChange = (selectedItem: { selected: number }) => {
    const nextPage = selectedItem.selected + 1;
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.appContainer}>
      <Toaster />
      
      <header>
        <h1>MovieSearch Pro</h1>
        <SearchBar onSubmit={handleSearch} />
      </header>

      <main>
        {isError && <ErrorMessage message="Failed to fetch movies. Please try again later." />}
        
        {isLoading && <Loader />}

        {isSuccess && data && (
          <>
            <MovieGrid movies={data.results} onSelect={setSelectedMovie} />
            
            {data.total_pages > 1 && (
              <Paginate
                pageCount={data.total_pages > 500 ? 500 : data.total_pages} 
                pageRangeDisplayed={5}
                marginPagesDisplayed={1}
                onPageChange={handlePageChange}
                forcePage={page - 1}
                containerClassName={css.pagination}
                activeClassName={css.active}
                nextLabel="→"
                previousLabel="←"
                pageClassName={css.pageItem}
                pageLinkClassName={css.pageLink}
                previousClassName={css.pageItem}
                previousLinkClassName={css.pageLink}
                nextClassName={css.pageItem}
                nextLinkClassName={css.pageLink}
                breakLabel="..."
                breakClassName={css.pageItem}
                breakLinkClassName={css.pageLink}
              />
            )}
          </>
        )}
      </main>

      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
        />
      )}
    </div>
  );
}

export default App;