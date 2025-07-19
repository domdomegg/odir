import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useRouter } from 'next/router';
import { EntitySearchBox } from './SearchBox';
import Modal from './Modal';
import { ENTITY_PREFIX } from '../helpers/entityPrefix';

export const OmniSearchBox: React.FC = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useHotkeys(
    ['ctrl+k', 'meta+k', 'ctrl+e', 'meta+e', 'ctrl+g', 'meta+g'],
    () => {
      setShowModal(true);
    },
    { preventDefault: true }
  );

  return (
    <Modal open={showModal} onClose={() => { setShowModal(false); }} className="!p-0">
      <EntitySearchBox
        autoFocus
        className="p-3 text-xl"
        onSelectExisting={({ slug }) => {
          router.push(`${ENTITY_PREFIX}${slug}`);
          setShowModal(false);
        }}
        onClose={() => setShowModal(false)}
      />
    </Modal>
  );
};
