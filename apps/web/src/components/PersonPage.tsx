import { PencilIcon } from '@heroicons/react/outline';
import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import ReactMarkdown from 'react-markdown';
import { Helmet } from 'react-helmet';
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
import { ProfileImageEditor } from './ProfileImageEditor';
import { RequestFormLink } from './RequestFormLink';

type EditorState = 'closed' | 'menu' | 'details' | 'image' | 'teams' | 'manager' | 'slugs';

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
  useHotkeys('i', (event) => {
    if (editorState === 'closed' || editorState === 'menu') {
      setEditorState('image');
      event.preventDefault();
    }
  });

  return (
    <>
      <Helmet>
        <title>
          Directory Navigator: {person.name}
        </title>
      </Helmet>
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
            <p className="text-2xl -mt-2 mb-2">{person.jobTitle}</p>
            {person.email && <Link href={`mailto:${encodeURIComponent(person.email)}`} className="underline block py-1">{person.email}</Link>}
            {person.phone && <Link href={`tel:${encodeURIComponent(person.phone)}`} className="underline block py-1">{person.phone}</Link>}
            {person.linkedin && <Link href={person.linkedin} className="underline block py-1">{person.linkedin}</Link>}
            {person.website && <Link href={person.website} className="underline block py-1">{person.website}</Link>}
          </div>
        </div>
        <h2 className="font-odir-header text-3xl font-bold mt-6 mb-1">Teams</h2>
        <PersonTeams person={person} teams={teams} relations={relations} />
        {person.about && (
        <>
          <h2 className="font-odir-header text-3xl font-bold mt-6 mb-1">About</h2>
          <PersonAbout person={person} />
        </>
        )}
        <PersonEditorModal editorState={editorState} setEditorState={setEditorState} person={person} relations={relations} teams={teams} persons={persons} slugs={slugs} hasDetailedAccess={hasDetailedAccess} refetch={refetch} />
      </Section>
    </>
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
}) => (
  <ReactMarkdown className="prose prose-h1:text-xl prose-h2:text-lg prose-h3:text-base text-black marker:text-stone-600 mt-2 max-w-none" allowedElements={['h1', 'h2', 'h3', 'p', 'a', 'ul', 'ol', 'li']}>{person.about ?? ''}</ReactMarkdown>
);

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
          email: { label: 'Email', inputType: 'text' },
          phone: { label: 'Phone', inputType: 'text' },
          linkedin: { label: 'LinkedIn', inputType: 'text' },
          website: { label: 'Website', inputType: 'text' },
          about: { label: 'About (supports markdown)', inputType: 'textarea' },
        }}
        initialValues={{
          name: person.name,
          jobTitle: person.jobTitle,
          email: person.email,
          phone: person.phone,
          linkedin: person.linkedin,
          website: person.website,
          about: person.about,
        }}
        showCurrent={false}
        showNew={false}
        onSubmit={async (data) => {
          await req('patch /admin/persons/{personId}', { personId: person.id }, data);
          internalOnClose();
        }}
      />
    );
  } else if (editorState === 'image') {
    contents = (
      <ProfileImageEditor onComplete={async (profileImageUri) => {
        await req('patch /admin/persons/{personId}', { personId: person.id }, { profilePic: profileImageUri });
        internalOnClose();
      }}
      />
    );
  } else {
    contents = (
      <>
        <SectionTitle>What do you want to edit?</SectionTitle>
        <ChevronList>
          <ChevronListButton title="Details" onClick={() => setEditorState('details')} variant="secondary">
            Change the person's name, job title, biography, etc.
          </ChevronListButton>
          <ChevronListButton title="Image" onClick={() => setEditorState('image')} variant="secondary">
            Upload a new profile image for this person.
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
        <div className="mt-4">
          <RequestFormLink message={`I wanted to edit the following page:\n\n${window.location.href}\n\nThe edits I wanted to make were:\n\n`} className="hover:underline">Something else</RequestFormLink>
        </div>
      </>
    );
  }

  return (
    <Modal open onClose={internalOnClose}>
      {contents}
    </Modal>
  );
};

export default PersonPage;
