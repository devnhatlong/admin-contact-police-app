import { useMutation } from "@tanstack/react-query";

export const useMutationHooks = (fnCallback) => {
    let mutation = useMutation({
        mutationFn: fnCallback
    });

    return mutation;
}