import { useRef } from 'react';
import { UploadFileToFilebaseFormComponent } from '@/components/UploadFileToFilebaseFormComponent';
import { ReactNotifications } from 'react-notifications-component';

export const UploadToFilebaseFabComponent = () => {
  const refModal = useRef<HTMLDialogElement | null>(null);

  return (
    <>
      <div
        className={
          'bg-primary text-primary-content rounded-full w-14 h-14 flex flex-col justify-center cursor-pointer fixed bottom-0 right-0 mx-8 my-8 tooltip tooltip-left'
        }
        data-tip="Upload File to Filebase"
        onClick={() => refModal.current!.showModal()}
      >
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className={'h-9 w-9 mx-auto'}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
          ></path>
        </svg>
      </div>

      <dialog ref={refModal} className="modal">
        <ReactNotifications />
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">Upload File to Filebase</h3>
          <UploadFileToFilebaseFormComponent modalRef={refModal} />
        </div>
      </dialog>
    </>
  );
};
