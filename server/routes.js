import passport from 'passport';
import { getPosts, getPost, addPost } from './controllers/posts';
import { login, signUp, logout } from './controllers/authentication';
import { getMeProfile, getMyBlockedProfiles } from './controllers/users';
import {
    getCountAllUnreadMessages,
    getCountAllNotSeenLikes,
    getCountAllNotSeenVisitors,
    getCountAllNotSeenRequests,
    getCountAllNotSeenPrimaryNotifications
} from "./controllers/notifications";

export default (app) => {
    // const jwt = passport.authenticate('jwt', { session: false }); // Just 'Unauthorized' if pass here
    // const local = passport.authenticate('local');

    // app.get('/api/getposts', jwt, getPosts);
    app.get('/api/getposts', getPosts); // allByField | allBySearch
    app.post('/api/getpost', getPost); // oneByField
    app.post('/api/addpost', addPost); // add

    app.post('/api/login', login);
    app.post('/api/signup', signUp);
    app.post('/api/logout', logout);

    app.post('/api/me/profile', getMeProfile);
    app.post('/api/me/myblockedprofiles', getMyBlockedProfiles);

    import('./controllers/uploadFile').then((module) => {
        app.post('/api/upload_file/:filetype/:entityname/:entityid/:foldername/:ismultiplesize/:ismultipleselect', module.uploadFileMulter, module.uploadFile);
        app.post('/api/delete_file/:filetype/:entityname/:entityid', /*module.deleteFileMulter, */module.deleteFile);
    });

    app.post('/api/countallunreadmessages', getCountAllUnreadMessages);
    app.post('/api/countallnotseenlikes', getCountAllNotSeenLikes);
    app.post('/api/countallnotseenvisitors', getCountAllNotSeenVisitors);
    app.post('/api/countallnotseenrequests', getCountAllNotSeenRequests);
    app.post('/api/countallnotseenprimarynotifications', getCountAllNotSeenPrimaryNotifications);
};
