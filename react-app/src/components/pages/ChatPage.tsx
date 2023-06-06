import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Grid, Typography, Switch, CircularProgress, Box } from '@mui/material';
import io, { Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = "http://localhost:3001";

enum UserType {
    HUMAN = 'human',
    AI = 'ai'
}

interface IMessage {
    userType: UserType;
    message: string;
}

const ChatPage: React.FC = () => {
    const [message, setMessage] = useState<string>('what t shirts are available in klarna?');
    const [pluginManifestUrl, setPluginManifestUrl] = useState<string>('https://www.klarna.com/.well-known/ai-plugin.json');
    const [chat, setChat] = useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isPluginMode, setIsPluginMode] = useState<boolean>(true);

    const socketRef = useRef<Socket | null>(null);
    const chatRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        socketRef.current = io(SOCKET_SERVER_URL);

        socketRef.current.on('chat message', (message: IMessage) => {
            setChat((chat) => [...chat, {
                userType: UserType.AI,
                message: message.message
            }]);
            setIsLoading(false);
        });

        setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (chatRef.current !== null) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [chat]);

    const sendMessage = (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        if(socketRef.current) {
            socketRef.current.emit('chat message', {
                message,
                isPluginMode,
                pluginManifestUrl
            });
            setChat((chat) => [...chat, {
                userType: UserType.HUMAN,
                message
            }]);
        }

        setMessage('');
    };

    const toggleMode = () => {
        if (!isPluginMode) {
            setMessage('what t shirts are available in klarna?');
        }
        else {
            setMessage('How many people live in Canada?');
        }
        setIsPluginMode(!isPluginMode);
    }

    return (
        <div>
            <Typography variant="h4" component="h1">
                GPT Chat
            </Typography>

            <Grid container spacing={2} alignItems="center" style={{ justifyContent: 'center' }}>
                <Grid item>
                    <Typography color={isPluginMode ? 'textSecondary' : 'primary'}>
                        Conversation Mode
                    </Typography>
                </Grid>
                <Grid item>
                    <Switch
                        checked={isPluginMode}
                        onChange={toggleMode}
                    />
                </Grid>
                <Grid item>
                    <Typography color={isPluginMode ? 'primary' : 'textSecondary'}>
                        Plugin Mode
                    </Typography>
                </Grid>
            </Grid>


            <div ref={chatRef} style={{ height: '35vh', overflowY: 'auto' }}>
                {chat.map((chat, index) => (
                    <Grid container direction={chat.userType === UserType.AI ? 'row-reverse' : 'row'} key={index}>
                        <Box
                            bgcolor={chat.userType === UserType.AI ? 'lightblue' : '#A2D9A0'}
                            marginLeft={chat.userType === UserType.AI ? '0' : '1%'}
                            marginRight={chat.userType === UserType.AI ? '1%' : '0'}
                            borderRadius="10px"
                            width="80%"
                            px={2}
                            py={1}
                            mt={1}
                            sx={{
                                position: 'relative',
                                overflow: 'visible'
                            }}
                        >
                            <Typography variant="body1" color="textPrimary" style={{ whiteSpace: 'pre-wrap' }}>
                                {chat.message}
                            </Typography>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    left: chat.userType === UserType.AI ? '99%' : '-1%',
                                    bottom: '-6px',
                                    transform: 'translateY(-50%)',
                                    height: '0',
                                    width: '0',
                                    borderTop: '8px solid transparent',
                                    borderBottom: '8px solid transparent',
                                    borderRight: chat.userType === UserType.AI ? 'none' : '8px solid #A2D9A0',
                                    borderLeft: chat.userType === UserType.AI ? '8px solid lightblue' : 'none',
                                }}
                            />
                        </Box>
                    </Grid>
                ))}
                <Box display="flex" pt={1} justifyContent="right" alignItems="right">
                    {isLoading && <CircularProgress />}
                </Box>
            </div>

            <form onSubmit={sendMessage} style={{ marginTop: '20px' }}>
                <Grid container spacing={2}>
                    {isPluginMode && (
                        <Grid item xs={12}>
                        <TextField
                            label="Plugin manifest url"
                            variant="outlined"
                            fullWidth
                            rows={4}
                            value={pluginManifestUrl}
                            onChange={(e) => setPluginManifestUrl(e.target.value)}
                        />
                    </Grid>)}


                    <Grid item xs={12}>
                        <TextField
                            label="Usert message"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={3}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </Grid>


                    <Grid item xs={12}>
                        <Button variant="contained" type="submit" color="primary" fullWidth>
                            Send
                        </Button>
                    </Grid>
                </Grid>
            </form>


        </div>
    );
};

export default ChatPage;

