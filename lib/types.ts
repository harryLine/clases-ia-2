export type ResourceLink = {
  id: string;
  lessonId: string;
  name: string;
  url: string;
  createdAt: string;
};

export type Lesson = {
  id: string;
  date: string;
  title: string;
  contentHtml: string;
  createdAt: string;
  updatedAt: string;
  resources: ResourceLink[];
};
