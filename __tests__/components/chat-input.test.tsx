import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '@/components/chat/chat-input';

describe('ChatInput Component', () => {
  it('should render with placeholder', () => {
    render(<ChatInput onSend={jest.fn()} placeholder="Test placeholder" />);
    
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
  });

  it('should call onSend with input value', async () => {
    const mockOnSend = jest.fn();
    const user = userEvent.setup();
    
    render(<ChatInput onSend={mockOnSend} />);
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test message');
    
    const sendButton = screen.getByRole('button');
    await user.click(sendButton);
    
    expect(mockOnSend).toHaveBeenCalledWith('Test message');
  });

  it('should clear input after sending', async () => {
    const mockOnSend = jest.fn();
    const user = userEvent.setup();
    
    render(<ChatInput onSend={mockOnSend} />);
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    await user.type(textarea, 'Test message');
    
    const sendButton = screen.getByRole('button');
    await user.click(sendButton);
    
    expect(textarea.value).toBe('');
  });

  it('should send message on Enter key', async () => {
    const mockOnSend = jest.fn();
    const user = userEvent.setup();
    
    render(<ChatInput onSend={mockOnSend} />);
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test message{Enter}');
    
    expect(mockOnSend).toHaveBeenCalledWith('Test message');
  });

  it('should add new line on Shift+Enter', async () => {
    const mockOnSend = jest.fn();
    const user = userEvent.setup();
    
    render(<ChatInput onSend={mockOnSend} />);
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    await user.type(textarea, 'Line 1{Shift>}{Enter}{/Shift}Line 2');
    
    expect(mockOnSend).not.toHaveBeenCalled();
    expect(textarea.value).toContain('\n');
  });

  it('should disable input when disabled prop is true', () => {
    render(<ChatInput onSend={jest.fn()} disabled={true} />);
    
    const textarea = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button');
    
    expect(textarea).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('should not send empty messages', async () => {
    const mockOnSend = jest.fn();
    const user = userEvent.setup();
    
    render(<ChatInput onSend={mockOnSend} />);
    
    const sendButton = screen.getByRole('button');
    await user.click(sendButton);
    
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('should trim whitespace from messages', async () => {
    const mockOnSend = jest.fn();
    const user = userEvent.setup();
    
    render(<ChatInput onSend={mockOnSend} />);
    
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, '  Test message  ');
    
    const sendButton = screen.getByRole('button');
    await user.click(sendButton);
    
    expect(mockOnSend).toHaveBeenCalledWith('Test message');
  });
});
