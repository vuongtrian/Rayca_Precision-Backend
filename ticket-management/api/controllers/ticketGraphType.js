const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLList,
  GraphQLID,
} = require("graphql");
const mongoose = require("mongoose");
const Ticket = mongoose.model(process.env.TICKET_MODEL);

const TicketType = new GraphQLObjectType({
  name: "Ticket",
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    description: { type: GraphQLString },
    status: { type: GraphQLString },
    priority: { type: GraphQLString },
    assignedTo: { type: GraphQLID },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

// Root Query
const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    ticket: {
      type: TicketType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Ticket.findById(args.id);
      },
    },
    tickets: {
      type: new GraphQLList(TicketType),
      resolve(parent, args) {
        return Ticket.find();
      },
    },
  },
});

// Mutations
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addTicket: {
      type: TicketType,
      args: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
      },
      resolve(parent, args) {
        let ticket = new Ticket({
          title: args.title,
          description: args.description,
        });
        return ticket.save();
      },
    },
    updateTicket: {
      type: TicketType,
      args: {
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        status: { type: GraphQLString },
      },
      resolve(parent, args) {
        return Ticket.findByIdAndUpdate(
          args.id,
          { title: args.title, status: args.status },
          { new: true }
        );
      },
    },
  },
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
