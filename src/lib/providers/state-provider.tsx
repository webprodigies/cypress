'use client';
import {
  Dispatch,
  FC,
  ReactNode,
  createContext,
  useContext,
  useReducer,
} from 'react';
import { File, Folder, workspace } from '../supabase/supabase.types';

type appFoldersType = Folder & { files: File[] | [] };
type appWorkspacesType = workspace & { folders: appFoldersType[] | [] };

interface AppState {
  workspaces: appWorkspacesType[] | [];
}

type Action =
  | { type: 'SET_WORKSPACES'; payload: [] | appWorkspacesType[] }
  | { type: 'ADD_WORKSPACE'; payload: appWorkspacesType }
  | { type: 'REMOVE_WORKSPACE'; payload: string }
  | {
      type: 'SET_FOLDERS';
      payload: { workspaceId: string; folders: [] | appFoldersType[] };
    }
  | {
      type: 'ADD_FOLDER';
      payload: { workspaceId: string; folder: appFoldersType };
    }
  | {
      type: 'REMOVE_FOLDER';
      payload: { workspaceId: string; folderId: string };
    }
  | {
      type: 'SET_FILES';
      payload: { workspaceId: string; folderId: string; files: [] | File[] };
    }
  | {
      type: 'ADD_FILE';
      payload: { workspaceId: string; folderId: string; file: File };
    }
  | {
      type: 'REMOVE_FILE';
      payload: { workspaceId: string; folderId: string; fileId: string };
    }
  | {
      type: 'UPDATE_EMOJI';
      payload: {
        id: string; // ID of the workspace, folder, or file to update
        emoji: string; // New emoji value
        type: 'workspace' | 'folder' | 'file'; // Type of entity to update
      };
    }
  | {
      type: 'UPDATE_TITLE';
      payload: {
        id: string;
        title: string;
        type: 'workspace' | 'folder' | 'file';
      };
    };

const initialState: AppState = { workspaces: [] };
// Reducer function
const appReducer = (
  state: AppState = initialState,
  action: Action
): AppState => {
  switch (action.type) {
    case 'SET_WORKSPACES': {
      return { ...state, workspaces: action.payload };
    }
    case 'ADD_WORKSPACE':
      return {
        ...state,
        workspaces: [...state.workspaces, action.payload],
      };
    case 'REMOVE_WORKSPACE':
      return {
        ...state,
        workspaces: state.workspaces.filter(
          (workspace) => workspace.id !== action.payload
        ),
      };
    case 'SET_FOLDERS': {
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return { ...workspace, folders: action.payload.folders };
          }
          return workspace;
        }),
      };
    }
    case 'ADD_FOLDER':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          return {
            ...workspace,
            folders: [...workspace.folders, action.payload.folder],
          };
        }),
      };
    case 'REMOVE_FOLDER':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: workspace.folders.filter(
                (folder) => folder.folderId !== action.payload.folderId
              ),
            };
          }
          return workspace;
        }),
      };
    case 'SET_FILES': {
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (folder.folderId === action.payload.folderId) {
                  return {
                    ...folder,
                    files: action.payload.files,
                  };
                }
                return folder;
              }),
            };
          }
          return workspace;
        }),
      };
    }
    case 'ADD_FILE':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (folder.folderId === action.payload.folderId) {
                  return {
                    ...folder,
                    files: [...folder.files, action.payload.file],
                  };
                }
                return folder;
              }),
            };
          }
          return workspace;
        }),
      };
    case 'REMOVE_FILE':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (workspace.id === action.payload.workspaceId) {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (folder.folderId === action.payload.folderId) {
                  return {
                    ...folder,
                    files: folder.files.filter(
                      (file) => file.id !== action.payload.fileId
                    ),
                  };
                }
                return folder;
              }),
            };
          }
          return workspace;
        }),
      };
    case 'UPDATE_EMOJI':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (
            workspace.id === action.payload.id &&
            action.payload.type === 'workspace'
          ) {
            return {
              ...workspace,
              emoji: action.payload.emoji,
            };
          } else {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (
                  folder.folderId === action.payload.id &&
                  action.payload.type === 'folder'
                ) {
                  return {
                    ...folder,
                    emoji: action.payload.emoji,
                  };
                } else {
                  return {
                    ...folder,
                    files: folder.files.map((file) => {
                      if (
                        file.id === action.payload.id &&
                        action.payload.type === 'file'
                      ) {
                        return {
                          ...file,
                          emoji: action.payload.emoji,
                        };
                      }
                      return file;
                    }),
                  };
                }
              }),
            };
          }
        }),
      };
    case 'UPDATE_TITLE':
      return {
        ...state,
        workspaces: state.workspaces.map((workspace) => {
          if (
            workspace.id === action.payload.id &&
            action.payload.type === 'workspace'
          ) {
            return {
              ...workspace,
              title: action.payload.title,
            };
          } else {
            return {
              ...workspace,
              folders: workspace.folders.map((folder) => {
                if (
                  folder.folderId === action.payload.id &&
                  action.payload.type === 'folder'
                ) {
                  return {
                    ...folder,
                    title: action.payload.title,
                  };
                } else {
                  return {
                    ...folder,
                    files: folder.files.map((file) => {
                      if (
                        file.id === action.payload.id &&
                        action.payload.type === 'file'
                      ) {
                        return {
                          ...file,
                          title: action.payload.title,
                        };
                      }
                      return file;
                    }),
                  };
                }
              }),
            };
          }
        }),
      };
    default:
      return state;
  }
};

const AppStateContext = createContext<
  | {
      state: AppState;
      dispatch: Dispatch<Action>;
    }
  | undefined
>(undefined);

interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: FC<AppStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
