# Attendance Generator

#### Video Demo: https://www.youtube.com/watch?v=pAAHUW3GQPc

#### Description:

Attendance Generator is a full-stack web application designed to help my church small group manage and track attendance statuses for the members. Built as my final project for Harvard's CS50 course, this application allows users to manage a list of people, update their attendance statuses (e.g., "Serving", "Sitting", "TBC"), and generate formatted attendance reports with a single click.

## Features

-   **Real-time Status Management**: Update attendance statuses for multiple people across different categories (Service 1, Service 2, Service 3, Serving, TBC, Others)
-   **Dual Mode Interface**:
    -   **Default Mode**: View and update current attendance
    -   **Edit Mode**: Modify the default list of people and their statuses
-   **Formatted Output**: Generate and copy beautifully formatted attendance messages to clipboard with proper Unicode formatting
-   **Real-time Synchronization**: Uses Supabase for real-time data synchronization across multiple devices
-   **PWA Support**: Installable as a Progressive Web App for offline access
-   **Responsive Design**: Works seamlessly on both desktop and mobile devices

## Technical Implementation

The application is built with:

-   **Frontend**: React with TypeScript for type-safe development
-   **Backend**: Supabase (PostgreSQL database with real-time capabilities)
-   **Styling**: Tailwind CSS for responsive design
-   **Icons**: React Icons for consistent UI elements
-   **State Management**: React hooks (useState, useEffect, useCallback, useMemo)

## How It Works

1. **Initialization**: The app fetches both current attendance data and default member lists from Supabase
2. **Status Updates**: Users can update each person's name and attendance status
3. **Data Persistence**: Changes are saved to Supabase with a buffering system to optimize network requests
4. **Report Generation**: Clicking "Generate Message" creates a formatted attendance report and copies it to clipboard

## Project Structure

-   `/components/`: Reusable React components (Person, InstallPrompt)
-   `/lib/`: Supabase client configuration
-   `/ts/`: TypeScript helper functions and server communication logic
-   `/types/`: TypeScript type definitions

## Key Functions

-   `copyGenerate()`: Formats attendance data into a structured message with Unicode bold formatting
-   `SupabaseChangeListener()`: Manages real-time updates across connected clients
-   `postCurrPpl()` & `postDefPpl()`: Handle data persistence with request buffering

## Learning Outcomes

This project demonstrates my understanding of:

-   Full-stack development with React and Supabase
-   Real-time data synchronization
-   Progressive Web App implementation
-   TypeScript for type safety
-   Responsive UI design with Tailwind CSS
-   Efficient state management in React applications
