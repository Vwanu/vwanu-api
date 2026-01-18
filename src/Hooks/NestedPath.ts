    import { HookContext } from "@feathersjs/feathers";

    export default (context: HookContext) => {
        context.params.query = {
          ...context.params.query,
          ...context.params.route
        };
      }
