const User = require('../models/user.model');
const Field = require('../models/field.model');

const asyncHandler = require('express-async-handler');


module.exports = {

    // add new field
    createField: asyncHandler(async (req, res) => {
        try {
            const data = req.body;
            console.log(data);
            const findOwner = await User.findById(data.owner_field);
            if (!findOwner) throw new Error("Not Found Username Owner Field.")
            else {
                const newField = await Field.create(data);
                res.send(newField);
            }
        } catch (error) {
            throw new Error(error)
        }
    }),

    // Update Status Field (Authenticated, v.v...)
    updateField: asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const findField = await Field.findById(id);
            if (!findField) throw new Error("Not Found Field");
            else {
                const updateField = await Field.findByIdAndUpdate(id, req.body, { new: true })
            }
        } catch (error) {
            throw new Error(error)
        }
    }),

    // Delete Field
    deleteField: asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const deleteField = await Field.findByIdAndDelete(id);
            res.status(200).json("Deleted Field.")
        } catch (error) {
            throw new Error(error)
        }
    }),

    // Block Field
    stopField: asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const findField = await Field.findById(id);
            if (!findField) throw new Error("Not Found Field");
            else {
                const blockField = await Field.findByIdAndUpdate(id,
                    { status: "Not Availble" },
                    {
                        new: true
                    })
            }
        } catch (error) {
            throw new Error(error)
        }
    }),



    // Get All Field
    getAllField: asyncHandler(async (req, res) => {
        try {
            const allField = await Field.find()
                .populate("owner_field");
            res.json(allField);
        } catch (error) {
            throw new Error(error)
        }
    }),

    // Get Field
    getField: asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const field = await Field.findById(id);
            res.json(field);
        } catch (error) {
            throw new Error(error)
        }
    }),

    waitField: asyncHandler(async (req, res) => {
        try {
            const list = await Field.find({ status: 'Wait For Authenticated' })
                .populate('owner_field', 'username')
                .populate('owner_field', 'full_name');
            res.status(200).json(list);
        } catch (error) {
            throw new Error(error);
        }
    }),

    // Get Field from Owner
    FieldsOwner: asyncHandler(async (req, res) => {
        const { id } = req.params;
        try {
            const listField = await Field.find({ owner_field: id });
            res.status(200).json(listField);
        } catch (error) {
            throw new Error(error);
        }

    }),

    //Submit Field 
    submitField: asyncHandler(async (req, res) => {
        const { id } = req.params;
        console.log(id);
        try {
            const submit = await Field.findByIdAndUpdate(id, {
                status: 'Available'
            }, {
                new: true
            });
            res.status(200).json("OKE");
        } catch (error) {
            throw new Error(error)
        }
    }),

    // Get Field Option
    getFieldOption: asyncHandler(async (req, res) => {
        const option = req.body;
        console.log(option);
        try {
            if (option && (option.type) && (option.district)) {
                const list = await Field.find({
                    type_field: option.type,
                    district: option.district
                })
                res.json(list);
            } else
                if (option && option.type) {
                    const list = await Field.find({ type_field: option.type, status: "Available" });
                    res.json(list);
                } else
                    if (option && option.district) {
                        const list = await Field.find({ district: option.district, status: "Available" });
                        res.json(list);
                    }
        } catch (error) {
            throw new Error(error)
        }
    })
}