// Define IEmbedProps and ChannelMessageContent interfaces locally
export interface IEmbedProps {
  color?: string;
  title?: string;
  url?: string;
  author?: {
    name: string;
    icon_url?: string;
    url?: string;
  };
  description?: string;
  thumbnail?: {
    url: string;
  };
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  image?: {
    url: string;
  };
  timestamp?: string;
  footer?: {
    text: string;
    icon_url?: string;
  };
}

export interface ChannelMessageContent {
  t: string;
  embed?: IEmbedProps[];
}