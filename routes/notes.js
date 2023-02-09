const express = require("express");
const validateUser = require("../middleware/fetchuser");
const logger = require('../utils/winston.service');
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Notes = require("../models/Notes");

//ROUTE 1; Get all the notes using: GET "/api/notes/fetchallnotes"
router.get("/notes", validateUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    logger.error(error.message);
    res.status(500).send("Intenel server error");
  }
});

//ROUTE 2; Add a new note using: POST "/api/notes/addnote"
router.post(
  "/notes",
  validateUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "must be atleast 5 characters").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      // if there are errors return bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const note = new Notes({ title, description, tag, user: req.user.id });
      const savednote = await note.save();
      res.json(savednote);
    } catch (error) {
      logger.error(error.message);
      res.status(500).send("Intenel server error");
    }
  }
);

//ROUTE 3; Update an existing note using: PUT "/api/notes/updatenote"
router.put("/notes/:id", validateUser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
    // Create a newNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // Find the note to be updated and update it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    logger.error(error.message);
    res.status(500).send("Intenel server error");
  }
});

//ROUTE 4; Delete an existing note using: DELETE "/api/notes/deletenote"
router.delete("/notes/:id", validateUser, async (req, res) => {
  const { title, description, tag } = req.body;

  try {
    // Find the note to be deleted and delete it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }

    // Allow deletion only if the user owns the Note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note: note });
  } catch (error) {
    logger.error(error.message);
    res.status(500).send("Intenel server error");
  }
});

module.exports = router;
