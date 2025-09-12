import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/app/store';
import { showLoader, hideLoader } from '@/features/loader/loaderSlice';

export const useLoader = () => {
  const dispatch = useDispatch<AppDispatch>();

  const show = (text?: string) => {
    dispatch(showLoader(text));
  };

  const hide = () => {
    dispatch(hideLoader());
  };

  const withLoader = async <T,>(
    callback: () => Promise<T>,
    loadingText?: string
  ): Promise<T> => {
    show(loadingText);
    try {
      const result = await callback();
      return result;
    } finally {
      hide();
    }
  };

  return { showLoader: show, hideLoader: hide, withLoader };
};
