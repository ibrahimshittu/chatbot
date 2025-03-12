# Chatbot using prisma


https://github.com/user-attachments/assets/c586f415-1f47-451a-b967-f841a7d093f8


## Features


### Prisma Schema

Create a schema using Prisma where the following is stored:
- User chat history
- User starred system prompts

### UI Enhancements

- Separate the responses in the UI as:
  - Left: AI
  - Right: User
- Store the chat in the database

### Starred Page

Add a page called `/starred` where the user can view all the system prompts they have starred with the input and output associated, and the LLM used to generate the response.

### To start

- Ensure you have Docker installed
- Run `npm i` to install the dependencies
- Run `npx prisma migrate dev` to set up the database
- Run `npm run dev` to start the development server
