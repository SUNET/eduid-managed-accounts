import React from "react";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

interface NotificationModalProps {
  id: string;
  title: React.ReactNode;
  mainText: React.ReactNode;
  showModal: boolean;
  closeModal: React.MouseEventHandler<HTMLButtonElement>;
  acceptModal: (event?: React.MouseEvent<HTMLElement>) => void;
  acceptButtonText: React.ReactNode;
}

function NotificationModal(props: NotificationModalProps) {
  function handlePress(event: React.KeyboardEvent<HTMLDivElement>) {
    event.preventDefault();
    if (event.key === "Enter") {
      props.acceptModal();
    }
  }

  return (
    <div id={props.id} tabIndex={-1} onKeyDown={handlePress} role="dialog" aria-hidden="true" data-backdrop="true">
      <Modal isOpen={props.showModal} className={props.id}>
        <ModalHeader>
          {props.title}
          <button id={`${props.id}-close-button`} className="close float-right" onClick={props.closeModal} />
        </ModalHeader>
        <ModalBody>{props.mainText}</ModalBody>
        <ModalFooter>
          <button id={`${props.id}-accept-button`} className="primary" onClick={props.acceptModal}>
            {props.acceptButtonText}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default NotificationModal;
