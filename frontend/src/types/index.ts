export interface Project {
  name: string;
}

export interface View {
  path: string;
  name: string;
}

export interface ViewContent {
  project: string;
  path: string;
  content: Record<string, unknown>;
}

export interface TreeNode {
  key: string;
  title: string;
  isLeaf?: boolean;
  children?: TreeNode[];
}
