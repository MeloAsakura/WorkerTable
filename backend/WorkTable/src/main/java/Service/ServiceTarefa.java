package Service;

import Model.Tarefa;
import Model.User;
import Repository.Tarefas.TarefaRepo;

import java.sql.SQLException;

public class ServiceTarefa {

    private final TarefaRepo repository;

    public ServiceTarefa(TarefaRepo repository) {
        this.repository = repository;
    }

    public Tarefa createTarefa(String nome, String notes) throws SQLException {
        if (nome == null || nome.isBlank()) {
            throw new IllegalArgumentException("O nome da tarefa não pode ser vazio.");
        }

        if (notes == null || notes.isBlank()) {
            throw new IllegalArgumentException("O notes da tarefa não pode ser vazio.");
        }

            Tarefa t=new Tarefa.builderTarefa()
                    .nome(nome)
                    .notes(notes)
                    .build();

            Tarefa createTarefa=repository.createTarefa(t);

            if(createTarefa==null){
                throw new RuntimeException();
            }
            return createTarefa;
        }


    public void deleteTarefa(User user, Tarefa tarefa) {
        if (user == null || tarefa == null) {
            throw new IllegalArgumentException("User e tarefa nao podem ser null");
        }
        int i = repository.deleteTarefa(user.getId(), tarefa.getId());

        if (i > 0) {
            System.out.println("Deletado.");
        }
    }

    public void modificarTarefa(Long id, String novoNome, Tarefa tarefa) {

        if (tarefa == null) {
            throw new IllegalArgumentException("Tarefa não encontrada.");
        }

        if (id == null || id<0) {
            throw new IllegalArgumentException("ID inválido.");
        }

        if (!id.equals(tarefa.getId())) {
            throw new IllegalArgumentException("O ID da tarefa não corresponde.");
        }

        if (novoNome == null || novoNome.isBlank()) {
            throw new IllegalArgumentException("O nome da tarefa não pode ser vazio.");
        }

        boolean modified=repository.updateNomeTarefaById(id, novoNome);

        if (modified) {
            tarefa.setNome(novoNome);
            System.out.println("Alteração concluída.");
        } else {
            throw new IllegalArgumentException("Não foi possível alterar a tarefa.");
        }
    }
}
