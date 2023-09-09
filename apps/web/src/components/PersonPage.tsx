import { PencilIcon } from '@heroicons/react/outline';
import React, { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import Section, { SectionTitle } from './Section';
import {
  EntityResponse, Person, PersonEdits, Relation, Slug, Team
} from '../helpers/generated-api-client';
import Link from './Link';
import Button from './Button';
import Modal from './Modal';
import { Form } from './Form';
import { useRawReq } from '../helpers/networking';
import { ChevronList, ChevronListButton } from './ChevronList';
import { TeamCardGrid } from './TeamCard';
import { GRADES } from '../helpers/grades';

type EditorState = 'closed' | 'menu' | 'details' | 'photo' | 'teams' | 'manager' | 'slugs';

const PersonPage: React.FC<{ data: EntityResponse & { type: 'person' }, refetch: () => Promise<unknown> }> = ({
  data: {
    person, relations, teams, persons, slugs, hasDetailedAccess
  }, refetch
}) => {
  const [editorState, setEditorState] = useState<EditorState>('closed');
  useHotkeys('e', () => {
    if (editorState === 'closed') {
      setEditorState('menu');
    }
  });
  useHotkeys('d', (event) => {
    if (editorState === 'closed' || editorState === 'menu') {
      setEditorState('details');
      event.preventDefault();
    }
  });
  useHotkeys('p', (event) => {
    if (editorState === 'closed' || editorState === 'menu') {
      setEditorState('photo');
      event.preventDefault();
    }
  });

  return (
    <Section>
      <div className="flex gap-4">
        <img src={person.profilePic ?? 'https://upload.wikimedia.org/wikipedia/commons/4/48/No_image_%28male%29.svg'} alt="" className="aspect-square object-cover w-80 shadow bg-white" />
        <div className="flex-1">
          <div className="flex gap-4">
            <div className="flex-1">
              <SectionTitle>{person.name}</SectionTitle>
            </div>
            <div>
              <div>
                <Button onClick={() => setEditorState('menu')}><PencilIcon className="h-5 mb-0.5 mr-0.5" /> Edit person</Button>
              </div>
            </div>
          </div>
          <p className="text-2xl -mt-2 mb-2">{person.jobTitle}{person.grade && ` (${person.grade})`}</p>
          {person.email && <Link href={`mailto:${encodeURIComponent(person.email)}`} className="underline block py-1">{person.email}</Link>}
          {person.linkedin && <Link href={person.linkedin} className="underline block py-1">{person.linkedin}</Link>}
        </div>
      </div>
      <h2 className="font-odir-header text-3xl font-bold mt-6 mb-1">Teams</h2>
      <PersonTeams person={person} teams={teams} relations={relations} />
      <h2 className="font-odir-header text-3xl font-bold mt-6 mb-1">About</h2>
      <PersonAbout person={person} />
      <PersonEditorModal editorState={editorState} setEditorState={setEditorState} person={person} relations={relations} teams={teams} persons={persons} slugs={slugs} hasDetailedAccess={hasDetailedAccess} refetch={refetch} />
    </Section>
  );
};

const PersonTeams: React.FC<{ person: Person, teams: Team[], relations: Relation[] }> = ({ person, teams, relations }) => {
  const memberOfTeams = relations.filter((r) => r.type === 'MEMBER_OF' && r.childId === person.id).map((r) => {
    const memberOfTeam = teams.find((t) => t.id === r.parentId);
    if (!memberOfTeam) throw new Error(`Person ${r.childId} was member of team ${r.parentId} (relation ${r.id}) but team not provided to PersonTeams component.`);
    return memberOfTeam;
  });

  if (!memberOfTeams.length) {
    return <div>This person is not on any teams.</div>;
  }

  return <TeamCardGrid teams={memberOfTeams} />;
};

const PersonAbout: React.FC<{ person: Person }> = ({
  person
}) => {
  return (
    <div className="flex flex-col gap-4">
      {!person.about && !person.howHelpMe && !person.howSupportOthers && !person.motivation && !person.policyBackground && <p>There's no additional information on this person yet.</p>}
      {person.about && (
      <div>
        <p className="font-bold">Who am I?</p>
        <p>{person.about}</p>
      </div>
      )}
      {person.howHelpMe && (
      <div>
        <p className="font-bold">How can you help me?</p>
        <p>{person.howHelpMe}</p>
      </div>
      )}
      {person.howSupportOthers && (
      <div>
        <p className="font-bold">How can I help you?</p>
        <p>{person.howSupportOthers}</p>
      </div>
      )}
      {person.motivation && (
      <div>
        <p className="font-bold">Motivation</p>
        <p>{person.motivation}</p>
      </div>
      )}
      {person.policyBackground && (
      <div>
        <p className="font-bold">Policy Background</p>
        <p>{person.policyBackground}</p>
      </div>
      )}
    </div>
  );
};

const PersonEditorModal: React.FC<{ editorState: EditorState, setEditorState: (editorState: EditorState) => void, person: Person, relations: Relation[], teams: Team[], persons: Person[], slugs: Slug[], hasDetailedAccess: boolean, refetch: () => Promise<unknown> }> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  editorState, setEditorState, person, relations, teams, persons, slugs, hasDetailedAccess, refetch
}) => {
  const req = useRawReq();
  const internalOnClose = async () => {
    setEditorState('closed');
    await refetch();
  };

  if (editorState === 'closed') {
    return null;
  }

  let contents: JSX.Element;
  if (editorState === 'details') {
    contents = (
      <Form<PersonEdits>
        title="Edit person details"
        definition={{
          name: { label: 'Name', inputType: 'text' },
          jobTitle: { label: 'Job title', inputType: 'text' },
          grade: { label: 'Grade', inputType: 'select', selectOptions: GRADES },
          email: { label: 'Email', inputType: 'text' },
          linkedin: { label: 'LinkedIn', inputType: 'text' },
          about: { label: 'Who am I?', inputType: 'textarea' },
          howHelpMe: { label: 'How can others help me?', inputType: 'textarea' },
          howSupportOthers: { label: 'How can I help others?', inputType: 'textarea' },
          motivation: { label: 'Motivation', inputType: 'textarea' },
          policyBackground: { label: 'Policy background', inputType: 'textarea' },
        }}
        initialValues={{
          name: person.name,
          jobTitle: person.jobTitle,
          grade: person.grade,
          email: person.email,
          linkedin: person.linkedin,
          about: person.about,
          howHelpMe: person.howHelpMe,
          howSupportOthers: person.howSupportOthers,
          motivation: person.motivation,
          policyBackground: person.policyBackground,
        }}
        showCurrent={false}
        showNew={false}
        onSubmit={async (data) => {
          await req('patch /admin/persons/{personId}', { personId: person.id }, data);
          internalOnClose();
        }}
      />
    );
  } else if (editorState === 'photo') {
    contents = (
      <ProfilePhotoEditor person={person} onComplete={internalOnClose} />
    );
  } else {
    contents = (
      <>
        <SectionTitle>What do you want to edit?</SectionTitle>
        <ChevronList>
          <ChevronListButton title="Details" onClick={() => setEditorState('details')} variant="secondary">
            Change the person's name, job title, biography, etc.
          </ChevronListButton>
          <ChevronListButton title="Photo" onClick={() => setEditorState('photo')} variant="secondary">
            Upload a new profile picture for this person.
          </ChevronListButton>
          {/* <ChevronListButton onClick={() => setEditorState('members')}>
            <h3 className="font-bold">Members</h3>
            <p>Change team members and managers</p>
          </ChevronListButton>
          <ChevronListButton onClick={() => setEditorState('children')}>
            <h3 className="font-bold">Subteams</h3>
            <p>Add or remove subteams</p>
          </ChevronListButton> */}
          {/* <ChevronListButton onClick={() => setEditorState('parents')}>
            <h3 className="font-bold">Parent teams</h3>
            <p>Change which teams this is part of</p>
          </ChevronListButton> */}
          {/* <ChevronListButton onClick={() => setEditorState('slugs')}>
            <h3 className="font-bold">Slugs</h3>
            <p>Manage short URLs for this team</p>
          </ChevronListButton> */}
        </ChevronList>
      </>
    );
  }

  return (
    <Modal open onClose={internalOnClose}>
      {contents}
    </Modal>
  );
};

const ProfilePhotoEditor: React.FC<{
  person: Person,
  onComplete: () => void
}> = ({ person, onComplete }) => {
  const req = useRawReq();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fileInputRef.current?.click();
  }, [fileInputRef.current]);

  return (
    <>
      <SectionTitle>Upload new profile photo</SectionTitle>
      <div className="my-4">
        {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
        <input type="file" className="py-2" accept="image/jpeg, image/png" capture="user" ref={fileInputRef} autoFocus />
      </div>
      <Button
        onClick={async () => {
          try {
            const file = fileInputRef.current?.files?.[0];
            if (!file) {
              throw new Error('No file selected');
            }

            if (file.size > 5_000_000) {
              throw new Error('The maximum file size you can upload is 5MB. Try compressing your image first.');
            }

            const dataUriBase64 = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                  resolve(reader.result);
                } else {
                  throw new Error(`Invalid reader result type: ${typeof reader.result}`);
                }
              };
              reader.readAsDataURL(file);
            });

            const profilePhotoUri = (await req('post /admin/blobs', { data: dataUriBase64 })).data;
            await req('patch /admin/persons/{personId}', { personId: person.id }, { profilePic: profilePhotoUri });
            onComplete();
          } catch (error) {
            alert(error);
          }
        }}
      >Submit
      </Button>
    </>
  );
};

export default PersonPage;
