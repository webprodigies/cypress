'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect } from 'react';
import { useAppState } from '../providers/state-provider';
import db from '../supabase/db';

const useRealtimeFiles = () => {
  const supabase = createClientComponentClient();
  const { dispatch, workspaceId, state } = useAppState();
  /**
 * DB _CHANGE
Object

commit_timestamp: "2023-10-06T18:22:34.565Z"

errors: null

eventType: "INSERT"

new: Object

created_at: "2023-10-06T18:22:34.414+00:00"

data: null

folder_id: "4919c33a-f45a-4048-9bad-ce4083097234"

icon_id: "📄"

id: "03f9538b-496c-4ff4-97f0-d67aceff74cf"

in_trash: null

title: "Untitled"

Object Prototype

old: {}

schema: "public"

table: "files"
 */

  /**DELETE
 * Object

commit_timestamp: "2023-10-06T18:23:44.952Z"

errors: null

eventType: "DELETE"

new: {}

old: {id: "03f9538b-496c-4ff4-97f0-d67aceff74cf"}

schema: "public"

table: "files"
 */
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'files',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const folderId = payload.new.folder_id;
            
          }
        }
      )
      .subscribe();
  }, [supabase]);
  return null;
};

export default useRealtimeFiles;
