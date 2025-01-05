const { requestLog } = require("../logger");
const {createProfileService, getProfileService} = require('../services/profileService')
const {requiredField} = require('../errorMessages')


class ProfileController {
    async create(req, res, next) {
        try {
            requestLog(req);
            const {placeId, tags} = req.body;
            if(!placeId) requiredField('placeId')
            if(!tags) requiredField('tags')

            const response = await createProfileService({placeId, tags})
            return res.status(200).json({...response})
        } catch(err) {
            next(err)
        }
    }

    async get(req, res, next) {
        try {
            requestLog(req);
            const response = await getProfileService()
            return res.status(200).json({...response})
        } catch(err) {
            next(err)
        }
    }
}


module.exports = new ProfileController()