import React, { useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import { gql, useMutation } from "@apollo/client";

const INSERT_BOOK_MUTATION = gql`
  mutation insertBook($input: books_insert_input!) {
    insert_books(objects: [$input]) {
      returning {
        id
        name
      }
    }
  }
`;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      "& > *": {
        margin: theme.spacing(1)
      }
    }
  })
);

export default function Add() {
  const classes = useStyles();
  const [name, setName] = useState("");
  const [insertBook] = useMutation(INSERT_BOOK_MUTATION);

  async function handleSubmit() {
    if (name !== "") {
      try {
        await insertBook({
          variables: {
            input: { name }
          },
          update: cache => {
            (cache as any).evict("ROOT_QUERY", "books");
            (cache as any).gc();
          },
          refetchQueries: ["books"]
        });
        setName("");
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <form
      className={classes.root}
      noValidate
      autoComplete="off"
      // onSubmit={handleSubmit}
    >
      <TextField
        id="standard-basic"
        label="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Add Book
      </Button>
    </form>
  );
}
