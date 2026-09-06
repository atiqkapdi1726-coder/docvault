'use client';

import { cn } from '@/lib/utils';
import { Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { Folder as FolderType } from '@/lib/types';

interface FolderTreeProps {
  folders: FolderType[];
  currentFolder: FolderType | null;
  onSelect: (folder: FolderType) => void;
  level?: number;
}

export function FolderTree({ folders, currentFolder, onSelect, level = 0 }: FolderTreeProps) {
  const rootFolders = folders.filter((f) => !f.parentId);

  return (
    <div className="space-y-1">
      {rootFolders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          allFolders={folders}
          currentFolder={currentFolder}
          onSelect={onSelect}
          level={level}
        />
      ))}
    </div>
  );
}

function FolderNode({
  folder,
  allFolders,
  currentFolder,
  onSelect,
  level,
}: {
  folder: FolderType;
  allFolders: FolderType[];
  currentFolder: FolderType | null;
  onSelect: (folder: FolderType) => void;
  level: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const children = allFolders.filter((f) => f.parentId === folder.id);
  const isActive = currentFolder?.id === folder.id;

  return (
    <div>
      <button
        onClick={() => {
          onSelect(folder);
          setExpanded(!expanded);
        }}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
          isActive
            ? 'bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]'
            : 'hover:bg-[rgb(var(--muted))]'
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {children.length > 0 ? (
          expanded ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )
        ) : (
          <span className="w-3.5" />
        )}
        <Folder size={16} className={isActive ? 'text-[rgb(var(--primary))]' : 'text-amber-500'} />
        <span className="flex-1 text-left truncate">{folder.name}</span>
      </button>

      {expanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <FolderNode
              key={child.id}
              folder={child}
              allFolders={allFolders}
              currentFolder={currentFolder}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
