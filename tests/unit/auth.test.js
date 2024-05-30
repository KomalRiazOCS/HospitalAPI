const mongoose = require("mongoose")
const {User} = require('../../models/users');
const auth = require('../../middleware/auth');

describe('auth middleware', () => {

    it('should populate req.user with the payload of a valid jwt', async () => {
        const user = {
            _id: mongoose.Types.ObjectId().toHexString(),
            isAdmin: true
        };

        const userObj = new User(user);
        const token = userObj.GenerateAuthToken();
        const req = {
            header: jest.fn().mockReturnValue(token)
        };

        const res= {};
        const next = jest.fn();

        auth(req, res, next);

        expect(req.user).toMatchObject(user);

    });  
});