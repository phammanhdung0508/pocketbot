# Embedded Messages and Interactive Components

Mezon provides an advanced feature for messages called Embedded Messages.

You can send a simple text message, a message with one or more embeds, a message with interactive components, or a combination of all three.

---

## Messages with Embeds (`IEmbedProps`)

An embed is a structured, richly formatted block of content within a message. Featuring elements like titles, images, and colored borders, it helps messages stand out and convey information more effectively.

The structure for an embed object is defined by the `IEmbedProps` interface, and a single message can contain an array of these objects.

| Property      | Type   | Description                                                                                                                                                                    |
| :------------ | :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`       | string | A hex color code (e.g., `#3498db`) for the accent border on the left of the embed.                                                                                             |
| `title`       | string | The main title of the embed.                                                                                                                                                   |
| `url`         | string | A URL to which the embed's `title` will link.                                                                                                                                  |
| `author`      | object | An object for the author block at the top of the embed. Contains `name` (string), `icon_url`? (string), and `url`? (string).                                                   |
| `description` | string | The main text content inside the embed. Supports basic markdown.                                                                                                               |
| `thumbnail`   | object | An object containing a `url` (string) for a small image in the top-right corner.                                                                                               |
| `fields`      | Array  | An array of field objects, each with a `name` (string), `value` (string), and optional `inline` (boolean) property. `inline: true` allows multiple fields to sit side-by-side. |
| `image`       | object | An object containing a `url` (string) for a large main image displayed at the bottom of the embed.                                                                             |
| `timestamp`   | string | An ISO 8601 formatted timestamp string, which is displayed in the footer.                                                                                                      |
| `footer`      | object | An object for the footer at the bottom of the embed. Contains `text` (string) and `icon_url`? (string).                                                                        |

**Example: Creating a Comprehensive Embed**

This example demonstrates how to use all the properties of `IEmbedProps` to create a detailed message embed.

```typescript
import { IEmbedProps, ChannelMessageContent } from "./interfaces";

// 1. Define the embed object
const embedElement: IEmbedProps = {
    color: "#e74c3c",
    title: "Mezon Platform Update",
    url: "https://mezon.vn/",
    author: {
        name: "Mezon Bot",
        icon_url: "https://cdn.mezon.vn/bot_avatar.png",
        url: "https://mezon.vn/"
    },
    description: "We're excited to announce new features for creating rich messages!",
    thumbnail: {
        url: "https://cdn.mezon.vn/thumbnail_icon.png"
    },
    fields: [
        { name: "New Feature", value: "Embeds (`IEmbedProps`)", inline: true },
        { name: "Status", value: "Released", inline: true },
        { name: "Coming Soon", value: "Interactive Components", inline: false }
    ],
    image: {
        url: "https://cdn.mezon.vn/main_image.png"
    },
    timestamp: new Date().toISOString(),
    footer: {
        text: "Mezon SDK v1.0",
        icon_url: "https://cdn.mezon.vn/footer_icon.png"
    }
};

// 2. Construct the message payload
const messagePayload: ChannelMessageContent = {
    t: "Check out our latest platform update!",
    embed: [embedElement] // Embeds are an array
};

// 3. Send the message using the client
// Assuming 'client' is an initialized MezonClient instance
client.sendMessage(
    "your_clan_id",
    "your_channel_id",
    1, // mode
    true, // is_public
    messagePayload
);
```

---

## Messages with Interactive Components

Interactive components allow you to add buttons, select menus, and other UI elements to your messages, enabling users to interact directly with your application through the chat interface.

### Interactive Components Structure

Components are organized into rows using `IMessageActionRow`. Each row can hold one or more components.

*   **`IMessageActionRow`**: Contains a single property, `components`, which is an array of component objects (`ButtonComponent`, `SelectComponent`, etc.).
*   **`IMessageComponent<T>`**: This is a generic wrapper for all components. It includes:
    *   `type` (`EMessageComponentType`): The type of the component (e.g., `BUTTON`, `SELECT`).
    *   `id` (string): A unique identifier you define for this component instance. This ID is used to identify which component was interacted with in backend events.
    *   `component` (`T`): The specific component object (e.g., `IButtonMessage`).

### Component Type: Button

Buttons are simple clickable elements.

*   **`EMessageComponentType.BUTTON`**: The type identifier for a button.
*   **`IButtonMessage`**: The interface for the button's properties.
    *   `label` (string): The text displayed on the button.
    *   `disable`? (boolean): If true, the button is grayed out and cannot be clicked.
    *   `style`? (`EButtonMessageStyle`): The button's color and appearance.
    *   `url`? (string): If the `style` is `LINK`, this URL is opened when the button is clicked.
*   **`EButtonMessageStyle`**: An enum for styling.
    *   `PRIMARY` (1): Standard purpose (e.g., blue)
    *   `SECONDARY` (2): Less emphasized (e.g., gray)
    *   `SUCCESS` (3): Indicates a positive action (e.g., green)
    *   `DANGER` (4): Indicates a destructive action (e.g., red)
    *   `LINK` (5): Renders the button as a hyperlink. Requires the `url` property.

**Example: Creating a Message with Buttons**

This example creates a message with a single action row containing three different buttons.

```typescript
import { 
    IMessageActionRow, 
    ButtonComponent,
    EMessageComponentType, 
    EButtonMessageStyle 
} from "./interfaces";

// 1. Define the buttons
const approveButton: ButtonComponent = {
    type: EMessageComponentType.BUTTON,
    id: "approve_request_123",
    component: {
        label: "Approve",
        style: EButtonMessageStyle.SUCCESS
    }
};

const denyButton: ButtonComponent = {
    type: EMessageComponentType.BUTTON,
    id: "deny_request_123",
    component: {
        label: "Deny",
        style: EButtonMessageStyle.DANGER
    }
};

const docsButton: ButtonComponent = {
    type: EMessageComponentType.BUTTON,
    id: "docs_link_button",
    component: {
        label: "View Docs",
        style: EButtonMessageStyle.LINK,
        url: "https://docs.mezon.vn/"
    }
};

// 2. Create an action row and add the components
const actionRow: IMessageActionRow = {
    components: [approveButton, denyButton, docsButton]
};

// 3. Construct the message payload
const messagePayload: ChannelMessageContent = {
    t: "A new request requires your approval.",
    components: [actionRow] // Components are an array of action rows
};

// 4. Send the message
client.sendMessage(
    "your_clan_id",
    "your_channel_id",
    1,
    true,
    messagePayload
);
```

### Other Component Types

The same pattern applies to other component types like `SELECT` and `INPUT`.

*   **Select Menus (`IMessageSelect`, `EMessageSelectType`)**: Create dropdowns for selecting text options, users, roles, or channels.
*   **Text Inputs (`IMessageInput`)**: Create modal forms with text input fields for gathering more detailed user responses.

By combining `embed` and `components`, you can create highly interactive and informative messages that significantly enhance the user experience on the Mezon platform.

---

## Listening for Component Interactions

Once you send a message with interactive components, you need a way to listen for and handle user interactions with them. The `MezonClient` is an `EventEmitter`, allowing you to subscribe to specific events that are triggered by these interactions. The `id` you assign to each component is crucial, as it's returned in the event payload, allowing you to identify exactly which component was used.

### Listening for Button Clicks: `onMessageButtonClicked`

This event is emitted whenever a user clicks on a `BUTTON` component in one of your messages.

**Method Signature:**
`client.onMessageButtonClicked(listener: (event: MessageButtonClicked) => void)`

**Event Payload (`MessageButtonClicked`):**

| Property     | Type   | Description                                            |
| :----------- | :----- | :----------------------------------------------------- |
| `clan_id`    | string | The ID of the clan where the interaction occurred.     |
| `channel_id` | string | The ID of the channel containing the message.          |
| `message_id` | string | The ID of the message that was interacted with.        |
| `sender_id`  | string | The ID of the user who clicked the button.             |
| `button_id`  | string | The unique `id` you assigned to the `ButtonComponent`. |

**Example: Handling a Button Click**

This example sends a message with "Approve" and "Deny" buttons, listens for a click, and then edits the original message to show the result.

```typescript
import { MezonClient } from './MezonClient';
import { MessageButtonClicked } from './rtapi/realtime';
import { IMessageActionRow, ButtonComponent, EMessageComponentType, EButtonMessageStyle, ChannelMessageContent } from "./interfaces";

const client = new MezonClient(/* ... credentials ... */);
// ... login logic ...

client.on('ready', async () => {
    const channel = await client.channels.fetch("your_channel_id");

    // 1. Define buttons for the message
    const approveButton: ButtonComponent = {
        type: EMessageComponentType.BUTTON,
        id: "approve_request_123",
        component: { label: "Approve", style: EButtonMessageStyle.SUCCESS }
    };
    const denyButton: ButtonComponent = {
        type: EMessageComponentType.BUTTON,
        id: "deny_request_123",
        component: { label: "Deny", style: EButtonMessageStyle.DANGER }
    };
    
    const actionRow: IMessageActionRow = { components: [approveButton, denyButton] };
    const payload: ChannelMessageContent = {
        t: "A new request requires your approval.",
        components: [actionRow]
    };
    
    // 2. Send the message
    await channel.send(payload);
    console.log(`Sent approval message to channel ${channel.id}`);
});

// 3. Set up the listener for all button clicks
client.onMessageButtonClicked(async (event: MessageButtonClicked) => {
    console.log(`Button clicked! ID: ${event.button_id}, User: ${event.sender_id}`);

    const channel = await client.channels.fetch(event.channel_id);
    const messageToEdit = await channel.messages.fetch(event.message_id);
    const user = await client.clans.get(event.clan_id)?.users.fetch(event.sender_id);

    if (!messageToEdit) return;

    // 4. Determine action based on which button was clicked
    let responseText = "";
    if (event.button_id === "approve_request_123") {
        responseText = `Request approved by ${user?.username || 'user'}.`;
    } else if (event.button_id === "deny_request_123") {
        responseText = `Request denied by ${user?.username || 'user'}.`;
    }

    // 5. Edit the original message and remove the buttons
    const updatedPayload: ChannelMessageContent = {
        t: responseText,
        components: [] // Pass an empty array to remove components
    };
    
    await messageToEdit.edit(updatedPayload);
    console.log(`Message ${messageToEdit.id} updated.`);
});
```

### Listening for Dropdown Selections: `onDropdownBoxSelected`

This event is emitted when a user selects one or more options from a `SELECT` component.

**Method Signature:**
`client.onDropdownBoxSelected(listener: (event: DropdownBoxSelected) => void)`

**Event Payload (`DropdownBoxSelected`):**

| Property       | Type     | Description                                                           |
| :------------- | :------- | :-------------------------------------------------------------------- |
| `message_id`   | string   | The ID of the message that was interacted with.                       |
| `channel_id`   | string   | The ID of the channel containing the message.                         |
| `selectbox_id` | string   | The unique `id` you assigned to the `SelectComponent`.                |
| `sender_id`    | string   | The ID of the user who made the selection.                            |
| `values`       | string[] | An array of strings representing the `value` of each option selected. |

**Example: Handling a Select Menu Selection**

First, we define a select menu with several options and send it. Then, we listen for a selection and send a confirmation message.

```typescript
/* Assuming an expanded IMessageSelect interface
export interface IMessageSelect {
  placeholder?: string;
  options: Array<{ label: string; value: string; }>;
}
*/
import { MezonClient } from './MezonClient';
import { DropdownBoxSelected, IMessageActionRow, SelectComponent, EMessageComponentType } from './interfaces';

const client = new MezonClient(/* ... */);
// ... login logic ...

client.on('ready', async () => {
    // 1. Define the Select Menu
    const choiceMenu: SelectComponent = {
        type: EMessageComponentType.SELECT,
        id: "department_choice_menu",
        component: {
            placeholder: "Choose a department...",
            options: [
                { label: "Engineering", value: "dept_eng" },
                { label: "Marketing", value: "dept_mkt" },
                { label: "Support", value: "dept_sup" },
            ]
        }
    };
    
    // 2. Create an action row and send the message
    const actionRow: IMessageActionRow = { components: [choiceMenu] };
    const payload: ChannelMessageContent = {
        t: "Please select the relevant department for your inquiry:",
        components: [actionRow]
    };

    const channel = await client.channels.fetch("your_channel_id");
    await channel.send(payload);
});


// 3. Set up the listener for dropdown selections
client.onDropdownBoxSelected(async (event: DropdownBoxSelected) => {
    const selectedValue = event.values[0]; // e.g., "dept_eng"
    
    console.log(`User ${event.sender_id} selected option: ${selectedValue}`);
    
    // 4. Send a follow-up message confirming the selection
    const channel = await client.channels.fetch(event.channel_id);
    await channel.send({
        t: `Thank you, your inquiry has been routed to the correct department.`
    });
});
```