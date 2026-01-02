import React from 'react';
import { render, screen } from '@testing-library/react';
import { Message } from '@/components/chat/message';
import { Message as MessageType } from '@/types';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

// Mock MarkdownRenderer
jest.mock('@/components/markdown-renderer', () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <div>{content}</div>,
}));

describe('Message Component', () => {
  const mockUserMessage: MessageType = {
    id: '1',
    role: 'user',
    content: 'Test user message',
    timestamp: Date.now(),
  };

  const mockTutorMessage: MessageType = {
    id: '2',
    role: 'tutor',
    content: 'Test tutor response',
    timestamp: Date.now(),
  };

  it('should render user message', () => {
    render(<Message message={mockUserMessage} />);
    
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByText('Test user message')).toBeInTheDocument();
  });

  it('should render tutor message', () => {
    render(<Message message={mockTutorMessage} />);
    
    expect(screen.getByText('Tutor')).toBeInTheDocument();
    expect(screen.getByText('Test tutor response')).toBeInTheDocument();
  });

  it('should apply different styles for user vs tutor', () => {
    const { container: userContainer } = render(<Message message={mockUserMessage} />);
    const { container: tutorContainer } = render(<Message message={mockTutorMessage} />);
    
    expect(userContainer.querySelector('.ml-8')).toBeInTheDocument();
    expect(tutorContainer.querySelector('.mr-8')).toBeInTheDocument();
  });

  it('should show copy button on hover (user message)', () => {
    render(<Message message={mockUserMessage} />);
    
    const copyButton = screen.getByLabelText('Copy message');
    expect(copyButton).toBeInTheDocument();
  });

  it('should show regenerate button for tutor messages', () => {
    const mockRegenerate = jest.fn();
    render(<Message message={mockTutorMessage} onRegenerate={mockRegenerate} />);
    
    const regenButton = screen.getByLabelText('Regenerate response');
    expect(regenButton).toBeInTheDocument();
  });

  it('should not show action buttons when streaming', () => {
    render(<Message message={mockTutorMessage} isStreaming={true} />);
    
    expect(screen.queryByLabelText('Copy message')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Regenerate response')).not.toBeInTheDocument();
  });
});
