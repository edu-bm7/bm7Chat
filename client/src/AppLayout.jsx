import PhotoBW from './assets/test_photo_bw.jpg'
import HackerPhoto from './assets/hacker.svg'
import VerticalDots from './assets/ellipsis-vertical-solid.svg'
import AddUser from './assets/user-plus-solid.svg'
import SearchSVG from './assets/magnifying-glass-solid.svg'
import SendButton from './assets/arrow-up-solid.svg'
import AttachButton from './assets/paperclip-solid.svg'
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client'
import './App.css'

const socket = io('http://localhost:3001');

function Settings() {
  return (
    <>
      <div className='flex flex-row justify-between bg-neutral-500 rounded-lg border border-stone-800'>
        <img src={PhotoBW} alt='test photo' className='w-1/12 mx-2 my-2 flex-shrink h-auto rounded-full' />
        <div className='w-3/12 flex justify-end'>
          <button className='w-2/12 flex-shrink h-auto mx-2 my-2'><img src={AddUser} alt='Add user Icon' /></button>
          <button className='w-[4%] flex-shrink h-auto mx-2 my-2'><img src={VerticalDots} alt='Options Menu' /></button>
        </div >
      </div>
    </>
  )
}

function ContactsChat() {
  return (
    <>
      <div className='bg-neutral-900 flex-grow rounded-lg border border-stone-800'>

      </div>
    </>
  )
}

function Contacts() {
  return (
    <>
      <div className='md:h-[95dvh] basis-1/3 rounded-lg flex flex-col'>
        <Settings />
        <ContactsChat />
      </div>
    </>
  )
}

function ContactInfo() {
  return (
    <>
      <div className='bg-neutral-500 flex flex-row justify-between rounded-lg border border-stone-800'>
        <div className='flex flex-row w-2/12 mx-2 my-2 flex-shrink h-auto'>
          <img src={HackerPhoto} alt='test photo' className='rounded-full w-1/4' />
          <p className='w-1/4 self-center'>HackerMan</p >
        </div>
        <div className='w-3/12 flex justify-end'>
          <button className='w-1/12 flex-shrink h-auto mx-2 my-2'><img src={SearchSVG} alt='Search Icon' /></button>
          <button className='w-[2%] flex-shrink h-auto mx-2 my-2'><img src={VerticalDots} alt='Options Menu' /></button>
        </div >
      </div>
    </>
  )
}

function TextContent() {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const reversedMessages = [...messages].reverse();
  return (
    <>
      <div className='bg-neutral-800 flex flex-grow flex-col-reverse content-end items-end rounded-lg border border-stone-800 p-4 overflow-y-auto'>
        {reversedMessages.map((message, index) => (
          <div key={index} className='text-white bg-neutral-500 rounded-md my-1 p-2'>
            {message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </>
  )
}

function TextInput() {
  const [input, setInput] = useState('');

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      socket.emit('message', input);
      setInput('');
    }
  };

  return (
    <>
      <form onSubmit={sendMessage} className='flex flex-row justify-between bg-neutral-500 h-16 text-gray-400 rounded-lg border border-stone-800'>
        <label className='rounded-l-lg cursor-pointer w-[4%] self-center'>
          <img src={AttachButton} alt='Attach a file Button' className='mx-2 my-2 h-auto' />
          <input type="file" className='hidden' />
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className='rounded-lg bg-neutral-800 focus:ring-0 grow p-2 h-12 self-center'
        />
        <button type='submit' className='w-[2%] flex-shrink h-auto mx-2 my-2'>
          <img src={SendButton} alt='Send Button' />
        </button>
      </form >
    </>
  );
}

function Text() {
  return (
    <>
      <div className='md:h-[95dvh] basis-2/3 rounded-lg flex flex-col'>
        <ContactInfo />
        <TextContent />
        <TextInput />
      </div>
    </>
  )
}

function AppLayout() {

  return (
    <>
      <div className='bg-neutral-700'>
        <div className='flex md:container mx-auto h-screen'>
          <div className='flex basis-full flex-row my-auto'>
            <Contacts />
            <Text />
          </div >
        </div >
      </div >
    </>
  )
}

export default AppLayout;
